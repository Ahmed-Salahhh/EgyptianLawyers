using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Services;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Reply;

// ── Form model ──────────────────────────────────────────────────────────────
// Bound from multipart/form-data via [AsParameters].
public sealed class ReplyToPostForm
{
    [FromForm]
    public string? Comment { get; set; }

    /// <summary>Optional parent reply ID for nested/threaded comments.</summary>
    [FromForm]
    public Guid? ParentReplyId { get; set; }

    /// <summary>Optional image or document attachment (max 10 MB).</summary>
    public IFormFile? File { get; set; }
}

// ── Command ──────────────────────────────────────────────────────────────────
public sealed record ReplyToPostCommand(
    Guid HelpPostId,
    string IdentityUserId,
    string? Comment,
    Guid? ParentReplyId,
    IFormFile? File
) : IRequest<ReplyToPostResult>;

public sealed record ReplyToPostResult(Guid Id);

// ── Validator ────────────────────────────────────────────────────────────────
public sealed class ReplyToPostValidator : AbstractValidator<ReplyToPostCommand>
{
    private static readonly HashSet<string> AllowedContentTypes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
    };

    public ReplyToPostValidator()
    {
        RuleFor(x => x.HelpPostId).NotEmpty().WithMessage("HelpPostId is required.");

        // A reply must carry at least a text comment or a file attachment.
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.Comment) || x.File is not null)
            .WithMessage("A reply must include a comment or a file attachment.");

        RuleFor(x => x.Comment).MaximumLength(2000).When(x => x.Comment is not null);

        // File is optional — only validate when provided.
        When(
            x => x.File is not null,
            () =>
            {
                RuleFor(x => x.File!.Length)
                    .LessThanOrEqualTo(10 * 1024 * 1024)
                    .WithMessage("Attachment must not exceed 10 MB.");

                RuleFor(x => x.File!.ContentType)
                    .Must(ct => AllowedContentTypes.Contains(ct))
                    .WithMessage("Only JPEG, PNG, WebP, GIF and PDF files are accepted.");
            }
        );
    }
}

// ── Handler ───────────────────────────────────────────────────────────────────
public sealed class ReplyToPostHandler : IRequestHandler<ReplyToPostCommand, ReplyToPostResult>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ReplyToPostHandler> _logger;

    public ReplyToPostHandler(
        ApplicationDbContext dbContext,
        ICloudinaryService cloudinaryService,
        INotificationService notificationService,
        ILogger<ReplyToPostHandler> logger)
    {
        _dbContext = dbContext;
        _cloudinaryService = cloudinaryService;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<ReplyToPostResult> Handle(
        ReplyToPostCommand request,
        CancellationToken cancellationToken)
    {
        // Fetch post (we need the author's LawyerId for the notification)
        var post = await _dbContext.HelpPosts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.HelpPostId, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.HelpPostId));

        // Fetch commenter
        var commenter = await _dbContext.Lawyers
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (commenter is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        HelpPostReply? parentReply = null;
        if (request.ParentReplyId.HasValue)
        {
            parentReply = await _dbContext.HelpPostReplies
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    r => r.Id == request.ParentReplyId.Value && r.HelpPostId == request.HelpPostId,
                    cancellationToken);
            if (parentReply is null)
                throw new NotFoundException(new NotFoundError("Parent reply", request.ParentReplyId.Value));
        }

        // Upload attachment to Cloudinary if one was provided.
        string? attachmentUrl = null;
        if (request.File is not null)
        {
            attachmentUrl = await _cloudinaryService.UploadAsync(
                request.File,
                cancellationToken: cancellationToken);
        }

        var reply = new HelpPostReply
        {
            Id = Guid.NewGuid(),
            HelpPostId = request.HelpPostId,
            LawyerId = commenter.Id,
            ParentReplyId = request.ParentReplyId,
            Comment = request.Comment,
            AttachmentUrl = attachmentUrl,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.HelpPostReplies.Add(reply);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // ── Notify target user (fire-and-forget safe) ─────────────────────────
        // Target: parent comment author if replying to a comment, else post author.
        // Users do not receive notifications for their own actions.
        Guid targetUserId = parentReply is not null ? parentReply.LawyerId : post.LawyerId;
        string message = parentReply is not null
            ? $"{commenter.FullName} replied to your comment."
            : $"{commenter.FullName} commented on your post.";

        if (commenter.Id != targetUserId)
        {
            try
            {
                var targetUser = await _dbContext.Lawyers
                    .AsNoTracking()
                    .Where(l => l.Id == targetUserId)
                    .Select(l => new { l.Id, l.FcmToken })
                    .FirstOrDefaultAsync(cancellationToken);

                if (targetUser is not null)
                {
                    await _notificationService.SendCommentNotificationAsync(
                        targetUserId: targetUser.Id,
                        postId: post.Id,
                        commenterName: commenter.FullName,
                        targetFcmToken: targetUser.FcmToken,
                        notificationBody: message,
                        cancellationToken: cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Comment notification failed for reply {ReplyId} on post {PostId}. " +
                    "The reply was saved successfully.",
                    reply.Id, post.Id);
            }
        }

        return new ReplyToPostResult(reply.Id);
    }
}

// ── Endpoint ──────────────────────────────────────────────────────────────────
public sealed class ReplyToPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(
                "/api/help-posts/{helpPostId:guid}/replies",
                async (
                    Guid helpPostId,
                    [AsParameters] ReplyToPostForm form,
                    HttpContext ctx,
                    IMediator mediator
                ) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

                    var command = new ReplyToPostCommand(
                        helpPostId,
                        identityUserId,
                        form.Comment,
                        form.ParentReplyId,
                        form.File
                    );

                    var result = await mediator.Send(command);
                    return Results.Created(
                        $"/api/help-posts/{helpPostId}/replies/{result.Id}",
                        result
                    );
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .DisableAntiforgery()
            .WithName("ReplyToPost")
            .WithTags("HelpPosts");
    }
}

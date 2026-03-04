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

    /// <summary>Optional image or document attachment (max 10 MB).</summary>
    public IFormFile? File { get; set; }
}

// ── Command ──────────────────────────────────────────────────────────────────
public sealed record ReplyToPostCommand(
    Guid HelpPostId,
    string IdentityUserId,
    string? Comment,
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

    public ReplyToPostHandler(
        ApplicationDbContext dbContext,
        ICloudinaryService cloudinaryService,
        INotificationService notificationService)
    {
        _dbContext = dbContext;
        _cloudinaryService = cloudinaryService;
        _notificationService = notificationService;
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
            Comment = request.Comment,
            AttachmentUrl = attachmentUrl,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.HelpPostReplies.Add(reply);
        await _dbContext.SaveChangesAsync(cancellationToken);

        // ── Notify post author — skip if the commenter IS the author ──────────
        if (commenter.Id != post.LawyerId)
        {
            // Fetch only what we need from the author (FcmToken for push)
            var author = await _dbContext.Lawyers
                .AsNoTracking()
                .Where(l => l.Id == post.LawyerId)
                .Select(l => new { l.Id, l.FcmToken })
                .FirstOrDefaultAsync(cancellationToken);

            if (author is not null)
            {
                await _notificationService.SendCommentNotificationAsync(
                    postAuthorId: author.Id,
                    postId: post.Id,
                    commenterName: commenter.FullName,
                    authorFcmToken: author.FcmToken,
                    cancellationToken: cancellationToken);
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

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

namespace EgyptianLawyers.Api.Features.HelpPosts.Create;

// ── Form model ──────────────────────────────────────────────────────────────
// Bound from multipart/form-data via [AsParameters].
// Scalar fields require [FromForm]; IFormFile is detected automatically.
public sealed class CreateHelpPostForm
{
    [FromForm]
    public string Description { get; set; } = string.Empty;

    [FromForm]
    public Guid CourtId { get; set; }

    [FromForm]
    public Guid CityId { get; set; }

    /// <summary>Optional image or document attachment (max 10 MB).</summary>
    [FromForm]
    public IFormFile? File { get; set; }
}

// ── Command ──────────────────────────────────────────────────────────────────
// IFormFile is safe inside a MediatR command — it is in-process and never serialised.
public sealed record CreateHelpPostCommand(
    string IdentityUserId,
    string Description,
    Guid CourtId,
    Guid CityId,
    IFormFile? File
) : IRequest<CreateHelpPostResult>;

public sealed record CreateHelpPostResult(Guid Id);

// ── Validator ────────────────────────────────────────────────────────────────
public sealed class CreateHelpPostValidator : AbstractValidator<CreateHelpPostCommand>
{
    private static readonly HashSet<string> AllowedContentTypes = new(
        StringComparer.OrdinalIgnoreCase
    )
    {
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
    };

    public CreateHelpPostValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MaximumLength(2000);

        RuleFor(x => x.CourtId).NotEmpty().WithMessage("Court is required.");
        RuleFor(x => x.CityId).NotEmpty().WithMessage("City is required.");

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
public sealed class CreateHelpPostHandler
    : IRequestHandler<CreateHelpPostCommand, CreateHelpPostResult>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly INotificationService _notificationService;

    public CreateHelpPostHandler(
        ApplicationDbContext dbContext,
        ICloudinaryService cloudinaryService,
        INotificationService notificationService
    )
    {
        _dbContext = dbContext;
        _cloudinaryService = cloudinaryService;
        _notificationService = notificationService;
    }

    public async Task<CreateHelpPostResult> Handle(
        CreateHelpPostCommand request,
        CancellationToken cancellationToken
    )
    {
        var lawyer = await _dbContext.Lawyers.FirstOrDefaultAsync(
            l => l.IdentityUserId == request.IdentityUserId,
            cancellationToken
        );

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        // Verify the court belongs to the selected city.
        var courtBelongsToCity = await _dbContext.Courts.AnyAsync(
            c => c.Id == request.CourtId && c.CityId == request.CityId,
            cancellationToken
        );
        if (!courtBelongsToCity)
            throw new NotFoundException(new NotFoundError("Court", request.CourtId));

        // Upload attachment to Cloudinary if one was provided.
        string? attachmentUrl = null;
        if (request.File is not null)
        {
            attachmentUrl = await _cloudinaryService.UploadAsync(
                request.File,
                cancellationToken: cancellationToken
            );
        }

        var helpPost = new HelpPost
        {
            Id = Guid.NewGuid(),
            Description = request.Description,
            AttachmentUrl = attachmentUrl,
            CourtId = request.CourtId,
            CityId = request.CityId,
            LawyerId = lawyer.Id,
            CreatedAt = DateTime.UtcNow,
        };

        _dbContext.HelpPosts.Add(helpPost);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.SendNewPostNotificationAsync(
            helpPost.Id,
            helpPost.Description,
            helpPost.CityId,
            cancellationToken
        );

        return new CreateHelpPostResult(helpPost.Id);
    }
}

// ── Endpoint ──────────────────────────────────────────────────────────────────
public sealed class CreateHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(
                "/api/help-posts",
                async (
                    [AsParameters] CreateHelpPostForm form,
                    HttpContext ctx,
                    IMediator mediator
                ) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

                    var command = new CreateHelpPostCommand(
                        identityUserId,
                        form.Description,
                        form.CourtId,
                        form.CityId,
                        form.File
                    );

                    var result = await mediator.Send(command);
                    return Results.Created($"/api/help-posts/{result.Id}", result);
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .DisableAntiforgery()
            .WithName("CreateHelpPost")
            .WithTags("HelpPosts");
    }
}

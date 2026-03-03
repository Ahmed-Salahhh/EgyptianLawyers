using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Services;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Create;

// Body sent by the mobile client — no LawyerId (resolved from JWT)
public sealed record CreateHelpPostRequest(
    string Description,
    string? AttachmentUrl,
    Guid CourtId,
    Guid CityId);

public sealed record CreateHelpPostCommand(
    string IdentityUserId,
    string Description,
    string? AttachmentUrl,
    Guid CourtId,
    Guid CityId
) : IRequest<CreateHelpPostResult>;

public sealed record CreateHelpPostResult(Guid Id);

public sealed class CreateHelpPostValidator : AbstractValidator<CreateHelpPostCommand>
{
    public CreateHelpPostValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(2000);

        RuleFor(x => x.AttachmentUrl)
            .MaximumLength(1000)
            .When(x => x.AttachmentUrl != null);

        RuleFor(x => x.CourtId).NotEmpty().WithMessage("Court is required.");
        RuleFor(x => x.CityId).NotEmpty().WithMessage("City is required.");
    }
}

public sealed class CreateHelpPostHandler : IRequestHandler<CreateHelpPostCommand, CreateHelpPostResult>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public CreateHelpPostHandler(ApplicationDbContext dbContext, INotificationService notificationService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<CreateHelpPostResult> Handle(CreateHelpPostCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        // Verify the court belongs to the selected city (Court.CityId is the FK in the new schema)
        var courtBelongsToCity = await _dbContext.Courts
            .AnyAsync(c => c.Id == request.CourtId && c.CityId == request.CityId, cancellationToken);
        if (!courtBelongsToCity)
            throw new NotFoundException(new NotFoundError("Court", request.CourtId));

        var helpPost = new HelpPost
        {
            Id = Guid.NewGuid(),
            Description = request.Description,
            AttachmentUrl = request.AttachmentUrl,
            CourtId = request.CourtId,
            CityId = request.CityId,
            LawyerId = lawyer.Id,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.HelpPosts.Add(helpPost);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await _notificationService.SendNewPostNotificationAsync(
            helpPost.Id, helpPost.Description, helpPost.CityId, cancellationToken);

        return new CreateHelpPostResult(helpPost.Id);
    }
}

public sealed class CreateHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/help-posts", async (CreateHelpPostRequest body, HttpContext ctx, IMediator mediator) =>
            {
                var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                var command = new CreateHelpPostCommand(
                    identityUserId, body.Description, body.AttachmentUrl, body.CourtId, body.CityId);
                var result = await mediator.Send(command);
                return Results.Created($"/api/help-posts/{result.Id}", result);
            })
            .RequireAuthorization()
            .WithName("CreateHelpPost")
            .WithTags("HelpPosts");
    }
}

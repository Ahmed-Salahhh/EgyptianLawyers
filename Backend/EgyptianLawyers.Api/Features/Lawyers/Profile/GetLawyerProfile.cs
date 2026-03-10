using System.Security.Claims;
using System.Text.Json.Serialization;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Profile;

public sealed record GetLawyerProfileQuery(
    Guid LawyerId,
    [property: JsonIgnore] string? ViewerIdentityUserId,
    [property: JsonIgnore] bool IsAdmin
) : IRequest<LawyerProfileResult>;

public sealed record LawyerCityDto(Guid Id, string Name);

public sealed record LawyerProfileResult(
    Guid Id,
    string FullName,
    string? Title,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    bool IsVerified,
    bool IsSuspended,
    DateTime CreatedAt,
    List<LawyerCityDto> ActiveCities
);

public sealed class GetLawyerProfileHandler
    : IRequestHandler<GetLawyerProfileQuery, LawyerProfileResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetLawyerProfileHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<LawyerProfileResult> Handle(
        GetLawyerProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var lawyer = await _dbContext
            .Lawyers.Include(l => l.ActiveCities)
            .FirstOrDefaultAsync(l => l.Id == request.LawyerId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        await TrackProfileViewAsync(request, lawyer.Id, cancellationToken);

        var activeCities = lawyer
            .ActiveCities.Select(c => new LawyerCityDto(c.Id, c.Name))
            .ToList();

        return new LawyerProfileResult(
            lawyer.Id,
            lawyer.FullName,
            lawyer.Title,
            lawyer.SyndicateCardNumber,
            lawyer.WhatsAppNumber,
            lawyer.IsVerified,
            lawyer.IsSuspended,
            lawyer.CreatedAt,
            activeCities
        );
    }

    private async Task TrackProfileViewAsync(
        GetLawyerProfileQuery request,
        Guid viewedLawyerId,
        CancellationToken cancellationToken
    )
    {
        if (request.IsAdmin || string.IsNullOrEmpty(request.ViewerIdentityUserId))
            return;

        // Resolve the viewer's LawyerId from their IdentityUserId.
        var viewerId = await _dbContext
            .Lawyers.Where(l => l.IdentityUserId == request.ViewerIdentityUserId)
            .Select(l => (Guid?)l.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (viewerId is null || viewerId == viewedLawyerId)
            return; // Viewer not found or self-view — skip.

        // Upsert: increment existing record or create a new one.
        var existingView = await _dbContext.ProfileViews.FirstOrDefaultAsync(
            pv => pv.ViewerId == viewerId && pv.ViewedId == viewedLawyerId,
            cancellationToken
        );

        if (existingView is not null)
        {
            existingView.ViewCount++;
            existingView.LastViewedAt = DateTime.UtcNow;
        }
        else
        {
            _dbContext.ProfileViews.Add(
                new ProfileView
                {
                    Id = Guid.NewGuid(),
                    ViewerId = viewerId.Value,
                    ViewedId = viewedLawyerId,
                    ViewCount = 1,
                    LastViewedAt = DateTime.UtcNow,
                }
            );
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }
}

public sealed class GetLawyerProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lawyers/{id:guid}",
                async (Guid id, ClaimsPrincipal user, IMediator mediator) =>
                {
                    var identityUserId = user.FindFirstValue(ClaimTypes.NameIdentifier);
                    var isAdmin = user.IsInRole("Admin");

                    var result = await mediator.Send(
                        new GetLawyerProfileQuery(id, identityUserId, isAdmin)
                    );

                    return Results.Ok(result);
                }
            )
            .RequireAuthorization()
            .WithName("GetLawyerProfile")
            .WithTags("Lawyers");
    }
}

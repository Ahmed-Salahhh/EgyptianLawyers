using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Profile;

public sealed record GetProfileViewersQuery(
    string IdentityUserId,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<ProfileViewerDto>>;

public sealed record ProfileViewerDto(
    Guid Id,
    string FullName,
    DateTime LastViewedAt,
    int ViewCount
);

public sealed class GetProfileViewersHandler
    : IRequestHandler<GetProfileViewersQuery, PaginatedResult<ProfileViewerDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetProfileViewersHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<PaginatedResult<ProfileViewerDto>> Handle(
        GetProfileViewersQuery request,
        CancellationToken cancellationToken
    )
    {
        var currentLawyerId = await _dbContext
            .Lawyers.Where(l => l.IdentityUserId == request.IdentityUserId)
            .Select(l => (Guid?)l.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentLawyerId is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var query = _dbContext
            .ProfileViews.Where(pv => pv.ViewedId == currentLawyerId)
            .OrderByDescending(pv => pv.LastViewedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var data = await query
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(pv => new ProfileViewerDto(
                pv.Viewer.Id,
                pv.Viewer.FullName,
                pv.LastViewedAt,
                pv.ViewCount
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedResult<ProfileViewerDto>(
            data,
            totalCount,
            request.PageIndex,
            request.PageSize
        );
    }
}

public sealed class GetProfileViewersEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lawyers/viewers",
                async (
                    ClaimsPrincipal user,
                    IMediator mediator,
                    int pageIndex = 1,
                    int pageSize = 20
                ) =>
                {
                    var identityUserId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
                    var result = await mediator.Send(
                        new GetProfileViewersQuery(identityUserId, pageIndex, pageSize)
                    );
                    return Results.Ok(result);
                }
            )
            .RequireAuthorization()
            .WithName("GetProfileViewers")
            .WithTags("Lawyers");
    }
}

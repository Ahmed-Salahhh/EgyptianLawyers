using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Features.Lookups;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record GetCourtsAndCitiesPaginatedQuery(
    Guid? CityId,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<LookupCityDto>>;

public sealed class GetCourtsAndCitiesPaginatedHandler
    : IRequestHandler<GetCourtsAndCitiesPaginatedQuery, PaginatedResult<LookupCityDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetCourtsAndCitiesPaginatedHandler(ApplicationDbContext dbContext) =>
        _dbContext = dbContext;

    public async Task<PaginatedResult<LookupCityDto>> Handle(
        GetCourtsAndCitiesPaginatedQuery request,
        CancellationToken cancellationToken
    )
    {
        var query = _dbContext.Cities.Include(c => c.Courts).AsQueryable();

        if (request.CityId.HasValue)
            query = query.Where(c => c.Id == request.CityId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var pageSize = Math.Max(1, request.PageSize);
        var pageIndex = Math.Max(1, request.PageIndex);

        var data = await query
            .OrderBy(c => c.Name)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new LookupCityDto(
                c.Id,
                c.Name,
                c.Courts.OrderBy(court => court.Name)
                    .Select(court => new LookupCourtDto(court.Id, court.Name))
                    .ToList()
            ))
            .ToListAsync(cancellationToken);

        return new PaginatedResult<LookupCityDto>(data, totalCount, pageIndex, pageSize);
    }
}

public sealed class GetCourtsAndCitiesPaginatedEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lookups/courts-and-cities/paginated",
                async (Guid? cityId, int? pageIndex, int? pageSize, IMediator mediator) =>
                {
                    var result = await mediator.Send(
                        new GetCourtsAndCitiesPaginatedQuery(cityId, pageIndex ?? 1, pageSize ?? 20)
                    );
                    return Results.Ok(result);
                }
            )
            .WithName("GetCourtsAndCitiesPaginated")
            .WithTags("Lookups");
    }
}

using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Features.Lookups;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record GetCourtsPaginatedQuery(
    Guid? CityId,
    Guid? CourtId,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<LookupCourtDto>>;

public sealed class GetCourtsPaginatedHandler
    : IRequestHandler<GetCourtsPaginatedQuery, PaginatedResult<LookupCourtDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetCourtsPaginatedHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<PaginatedResult<LookupCourtDto>> Handle(
        GetCourtsPaginatedQuery request,
        CancellationToken cancellationToken
    )
    {
        var query = _dbContext.Courts.AsQueryable();

        if (request.CityId.HasValue)
            query = query.Where(c => c.CityId == request.CityId.Value);

        if (request.CourtId.HasValue)
            query = query.Where(c => c.Id == request.CourtId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var pageSize = Math.Max(1, request.PageSize);
        var pageIndex = Math.Max(1, request.PageIndex);

        var data = await query
            .OrderBy(c => c.Name)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new LookupCourtDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);

        return new PaginatedResult<LookupCourtDto>(data, totalCount, pageIndex, pageSize);
    }
}

public sealed class GetCourtsPaginatedEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lookups/courts/paginated",
                async (
                    Guid? cityId,
                    Guid? courtId,
                    int? pageIndex,
                    int? pageSize,
                    IMediator mediator
                ) =>
                {
                    var result = await mediator.Send(
                        new GetCourtsPaginatedQuery(cityId, courtId, pageIndex ?? 1, pageSize ?? 20)
                    );
                    return Results.Ok(result);
                }
            )
            .WithName("GetCourtsPaginated")
            .WithTags("Lookups");
    }
}

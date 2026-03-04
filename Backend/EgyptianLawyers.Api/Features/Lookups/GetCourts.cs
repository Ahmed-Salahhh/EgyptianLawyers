using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lookups;

public sealed record GetCourtsQuery(Guid? CityId, Guid? CourtId) : IRequest<List<LookupCourtDto>>;

public sealed class GetCourtsHandler : IRequestHandler<GetCourtsQuery, List<LookupCourtDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetCourtsHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<List<LookupCourtDto>> Handle(
        GetCourtsQuery request,
        CancellationToken cancellationToken
    )
    {
        var query = _dbContext.Courts.AsQueryable();

        if (request.CityId.HasValue)
            query = query.Where(c => c.CityId == request.CityId.Value);

        if (request.CourtId.HasValue)
            query = query.Where(c => c.Id == request.CourtId.Value);

        return await query
            .OrderBy(c => c.Name)
            .Select(c => new LookupCourtDto(c.Id, c.Name))
            .ToListAsync(cancellationToken);
    }
}

public sealed class GetCourtsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lookups/courts",
                async (Guid? cityId, Guid? courtId, IMediator mediator) =>
                {
                    var result = await mediator.Send(new GetCourtsQuery(cityId, courtId));
                    return Results.Ok(result);
                }
            )
            .WithName("GetCourts")
            .WithTags("Lookups");
    }
}

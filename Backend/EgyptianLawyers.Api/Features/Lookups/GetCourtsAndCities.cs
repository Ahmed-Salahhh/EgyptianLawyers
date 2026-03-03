using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lookups;

public sealed record GetCourtsAndCitiesQuery(Guid? CityId) : IRequest<List<LookupCityDto>>;

public sealed record LookupCourtDto(Guid Id, string Name);

public sealed record LookupCityDto(Guid Id, string Name, List<LookupCourtDto> Courts);

public sealed class GetCourtsAndCitiesHandler : IRequestHandler<GetCourtsAndCitiesQuery, List<LookupCityDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetCourtsAndCitiesHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<List<LookupCityDto>> Handle(GetCourtsAndCitiesQuery request, CancellationToken cancellationToken)
    {
        var query = _dbContext.Cities
            .Include(c => c.Courts)
            .AsQueryable();

        if (request.CityId.HasValue)
            query = query.Where(c => c.Id == request.CityId.Value);

        return await query
            .OrderBy(c => c.Name)
            .Select(c => new LookupCityDto(
                c.Id,
                c.Name,
                c.Courts
                    .OrderBy(court => court.Name)
                    .Select(court => new LookupCourtDto(court.Id, court.Name))
                    .ToList()))
            .ToListAsync(cancellationToken);
    }
}

public sealed class GetCourtsAndCitiesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/lookups/courts-and-cities", async (Guid? cityId, IMediator mediator) =>
            {
                var result = await mediator.Send(new GetCourtsAndCitiesQuery(cityId));
                return Results.Ok(result);
            })
            .WithName("GetCourtsAndCities")
            .WithTags("Lookups");
    }
}

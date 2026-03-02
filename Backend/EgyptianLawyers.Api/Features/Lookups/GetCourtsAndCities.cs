using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lookups;

public sealed record GetCourtsAndCitiesQuery() : IRequest<GetCourtsAndCitiesResult>;

public sealed record LookupCityDto(Guid Id, string Name);

public sealed record LookupCourtDto(Guid Id, string Name, List<LookupCityDto> Cities);

public sealed record GetCourtsAndCitiesResult(List<LookupCourtDto> Courts);

public sealed class GetCourtsAndCitiesHandler : IRequestHandler<GetCourtsAndCitiesQuery, GetCourtsAndCitiesResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetCourtsAndCitiesHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<GetCourtsAndCitiesResult> Handle(GetCourtsAndCitiesQuery request, CancellationToken cancellationToken)
    {
        var courts = await _dbContext.Courts
            .Include(c => c.Cities)
            .OrderBy(c => c.Name)
            .Select(c => new LookupCourtDto(
                c.Id,
                c.Name,
                c.Cities
                    .OrderBy(city => city.Name)
                    .Select(city => new LookupCityDto(city.Id, city.Name))
                    .ToList()))
            .ToListAsync(cancellationToken);

        return new GetCourtsAndCitiesResult(courts);
    }
}

public sealed class GetCourtsAndCitiesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/lookups/courts-and-cities", async (IMediator mediator) =>
            {
                var result = await mediator.Send(new GetCourtsAndCitiesQuery());
                return Results.Ok(result);
            })
            .WithName("GetCourtsAndCities")
            .WithTags("Lookups");
    }
}
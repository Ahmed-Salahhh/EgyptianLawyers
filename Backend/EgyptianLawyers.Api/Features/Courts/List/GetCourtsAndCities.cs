using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Courts.List;

public record GetCourtsAndCitiesQuery : IRequest<GetCourtsAndCitiesResult>;

public record CourtDto(Guid Id, string Name, List<CityDto> Cities);
public record CityDto(Guid Id, string Name);

public record GetCourtsAndCitiesResult(List<CourtDto> Courts);

public class GetCourtsAndCitiesHandler : IRequestHandler<GetCourtsAndCitiesQuery, GetCourtsAndCitiesResult>
{
    private readonly ApplicationDbContext _db;

    public GetCourtsAndCitiesHandler(ApplicationDbContext db) => _db = db;

    public async Task<GetCourtsAndCitiesResult> Handle(GetCourtsAndCitiesQuery request, CancellationToken cancellationToken)
    {
        var courts = await _db.Courts
            .Include(c => c.Cities)
            .OrderBy(c => c.Name)
            .Select(c => new CourtDto(
                c.Id,
                c.Name,
                c.Cities.OrderBy(x => x.Name).Select(x => new CityDto(x.Id, x.Name)).ToList()))
            .ToListAsync(cancellationToken);

        return new GetCourtsAndCitiesResult(courts);
    }
}

public class GetCourtsAndCitiesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/courts", async (IMediator mediator) =>
        {
            var result = await mediator.Send(new GetCourtsAndCitiesQuery());
            return Results.Ok(result);
        })
        .WithName("GetCourtsAndCities")
        .WithTags("Courts");
    }
}

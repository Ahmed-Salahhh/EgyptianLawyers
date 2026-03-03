using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Profile;

public sealed record GetLawyerProfileQuery(Guid LawyerId) : IRequest<LawyerProfileResult>;

public sealed record LawyerCityDto(Guid Id, string Name);

public sealed record LawyerProfileResult(
    Guid Id,
    string FullName,
    string? Title,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    bool IsVerified,
    DateTime CreatedAt,
    List<LawyerCityDto> ActiveCities);

public sealed class GetLawyerProfileHandler : IRequestHandler<GetLawyerProfileQuery, LawyerProfileResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetLawyerProfileHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<LawyerProfileResult> Handle(GetLawyerProfileQuery request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .Include(l => l.ActiveCities)
            .FirstOrDefaultAsync(l => l.Id == request.LawyerId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        var activeCities = lawyer.ActiveCities
            .Select(c => new LawyerCityDto(c.Id, c.Name))
            .ToList();

        return new LawyerProfileResult(
            lawyer.Id,
            lawyer.FullName,
            lawyer.Title,
            lawyer.SyndicateCardNumber,
            lawyer.WhatsAppNumber,
            lawyer.IsVerified,
            lawyer.CreatedAt,
            activeCities);
    }
}

public sealed class GetLawyerProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/lawyers/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                var result = await mediator.Send(new GetLawyerProfileQuery(id));
                return Results.Ok(result);
            })
            .RequireAuthorization()
            .WithName("GetLawyerProfile")
            .WithTags("Lawyers");
    }
}

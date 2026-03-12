using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Profile;

public sealed record GetMyProfileQuery(string IdentityUserId) : IRequest<LawyerProfileResult>;

public sealed class GetMyProfileHandler : IRequestHandler<GetMyProfileQuery, LawyerProfileResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetMyProfileHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<LawyerProfileResult> Handle(
        GetMyProfileQuery request,
        CancellationToken cancellationToken
    )
    {
        var lawyer = await _dbContext
            .Lawyers.Include(l => l.ActiveCities)
            .FirstOrDefaultAsync(
                l => l.IdentityUserId == request.IdentityUserId,
                cancellationToken
            );

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var activeCities = lawyer
            .ActiveCities.Select(c => new LawyerCityDto(c.Id, c.Name))
            .ToList();

        return new LawyerProfileResult(
            lawyer.Id,
            lawyer.FullName,
            lawyer.Title,
            lawyer.AvatarUrl,
            lawyer.SyndicateCardNumber,
            lawyer.WhatsAppNumber,
            lawyer.IsVerified,
            lawyer.IsSuspended,
            lawyer.CreatedAt,
            activeCities
        );
    }
}

public sealed class GetMyProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet(
                "/api/lawyers/me",
                async (HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    var result = await mediator.Send(new GetMyProfileQuery(identityUserId));
                    return Results.Ok(result);
                }
            )
            .RequireAuthorization()
            .WithName("GetMyProfile")
            .WithTags("Lawyers");
    }
}

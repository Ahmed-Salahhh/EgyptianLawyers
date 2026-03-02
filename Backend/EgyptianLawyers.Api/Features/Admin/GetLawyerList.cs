using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record GetLawyerListQuery(bool? IsVerified, bool? IsSuspended) : IRequest<List<AdminLawyerDto>>;

public sealed record AdminLawyerDto(
    Guid Id,
    string FullName,
    string Email,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    bool IsVerified,
    bool IsSuspended,
    DateTime CreatedAt);

public sealed class GetLawyerListHandler : IRequestHandler<GetLawyerListQuery, List<AdminLawyerDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetLawyerListHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<List<AdminLawyerDto>> Handle(GetLawyerListQuery request, CancellationToken cancellationToken)
    {
        var query = from lawyer in _dbContext.Lawyers
                    join user in _dbContext.Users on lawyer.IdentityUserId equals user.Id
                    select new { lawyer, user.Email };

        if (request.IsVerified.HasValue)
            query = query.Where(x => x.lawyer.IsVerified == request.IsVerified.Value);

        if (request.IsSuspended.HasValue)
            query = query.Where(x => x.lawyer.IsSuspended == request.IsSuspended.Value);

        return await query
            .OrderByDescending(x => x.lawyer.CreatedAt)
            .Select(x => new AdminLawyerDto(
                x.lawyer.Id,
                x.lawyer.FullName,
                x.Email ?? string.Empty,
                x.lawyer.SyndicateCardNumber,
                x.lawyer.WhatsAppNumber,
                x.lawyer.IsVerified,
                x.lawyer.IsSuspended,
                x.lawyer.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

public sealed class GetLawyerListEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/lawyers", async (bool? isVerified, bool? isSuspended, IMediator mediator) =>
            {
                var result = await mediator.Send(new GetLawyerListQuery(isVerified, isSuspended));
                return Results.Ok(result);
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("GetLawyerList")
            .WithTags("Admin");
    }
}

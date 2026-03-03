using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record GetLawyerListQuery(
    bool? IsVerified,
    bool? IsSuspended,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<AdminLawyerDto>>;

public sealed record AdminLawyerDto(
    Guid Id,
    string FullName,
    string Email,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    bool IsVerified,
    bool IsSuspended,
    DateTime CreatedAt);

public sealed class GetLawyerListHandler : IRequestHandler<GetLawyerListQuery, PaginatedResult<AdminLawyerDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetLawyerListHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<PaginatedResult<AdminLawyerDto>> Handle(GetLawyerListQuery request, CancellationToken cancellationToken)
    {
        var query = from lawyer in _dbContext.Lawyers
                    join user in _dbContext.Users on lawyer.IdentityUserId equals user.Id
                    select new { lawyer, user.Email };

        if (request.IsVerified.HasValue)
            query = query.Where(x => x.lawyer.IsVerified == request.IsVerified.Value);

        if (request.IsSuspended.HasValue)
            query = query.Where(x => x.lawyer.IsSuspended == request.IsSuspended.Value);

        var orderedQuery = query.OrderByDescending(x => x.lawyer.CreatedAt);

        var totalCount = await orderedQuery.CountAsync(cancellationToken);

        var pageSize = Math.Max(1, request.PageSize);
        var pageIndex = Math.Max(1, request.PageIndex);

        var data = await orderedQuery
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
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

        return new PaginatedResult<AdminLawyerDto>(data, totalCount, pageIndex, pageSize);
    }
}

public sealed class GetLawyerListEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/lawyers",
                async (bool? isVerified, bool? isSuspended, int pageIndex, int pageSize, IMediator mediator) =>
                {
                    var result = await mediator.Send(
                        new GetLawyerListQuery(isVerified, isSuspended, pageIndex, pageSize));
                    return Results.Ok(result);
                })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("GetLawyerList")
            .WithTags("Admin");
    }
}

using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Feed;

public sealed record GetHelpFeedQuery(
    Guid? CourtId,
    Guid? CityId,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<HelpPostFeedItemDto>>;

public sealed record HelpPostFeedItemDto(
    Guid Id,
    string Description,
    string? AttachmentUrl,
    Guid CourtId,
    string CourtName,
    Guid CityId,
    string CityName,
    Guid LawyerId,
    string LawyerFullName,
    int ReplyCount,
    DateTime CreatedAt);

public sealed class GetHelpFeedHandler : IRequestHandler<GetHelpFeedQuery, PaginatedResult<HelpPostFeedItemDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetHelpFeedHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<PaginatedResult<HelpPostFeedItemDto>> Handle(GetHelpFeedQuery request, CancellationToken cancellationToken)
    {
        var query = _dbContext.HelpPosts
            .Include(p => p.Court)
            .Include(p => p.City)
            .Include(p => p.Lawyer)
            .AsQueryable();

        if (request.CourtId.HasValue)
            query = query.Where(p => p.CourtId == request.CourtId.Value);

        if (request.CityId.HasValue)
            query = query.Where(p => p.CityId == request.CityId.Value);

        var orderedQuery = query.OrderByDescending(p => p.CreatedAt);

        var totalCount = await orderedQuery.CountAsync(cancellationToken);

        var pageSize = Math.Max(1, request.PageSize);
        var pageIndex = Math.Max(1, request.PageIndex);

        var data = await orderedQuery
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new HelpPostFeedItemDto(
                p.Id,
                p.Description,
                p.AttachmentUrl,
                p.CourtId,
                p.Court.Name,
                p.CityId,
                p.City.Name,
                p.LawyerId,
                p.Lawyer.FullName,
                p.Replies.Count,
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PaginatedResult<HelpPostFeedItemDto>(data, totalCount, pageIndex, pageSize);
    }
}

public sealed class GetHelpFeedEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/help-posts/feed",
                async (Guid? courtId, Guid? cityId, int pageIndex, int pageSize, IMediator mediator) =>
                {
                    var result = await mediator.Send(
                        new GetHelpFeedQuery(courtId, cityId, pageIndex, pageSize));
                    return Results.Ok(result);
                })
            .RequireAuthorization()
            .WithName("GetHelpFeed")
            .WithTags("HelpPosts");
    }
}

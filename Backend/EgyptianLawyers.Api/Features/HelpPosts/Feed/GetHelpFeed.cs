using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Feed;

public sealed record GetHelpFeedQuery(Guid? CityId) : IRequest<List<HelpPostFeedItemDto>>;

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
    DateTime CreatedAt);

public sealed class GetHelpFeedHandler : IRequestHandler<GetHelpFeedQuery, List<HelpPostFeedItemDto>>
{
    private readonly ApplicationDbContext _dbContext;

    public GetHelpFeedHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<HelpPostFeedItemDto>> Handle(GetHelpFeedQuery request, CancellationToken cancellationToken)
    {
        var query = _dbContext.HelpPosts
            .Include(p => p.Court)
            .Include(p => p.City)
            .Include(p => p.Lawyer)
            .AsQueryable();

        if (request.CityId.HasValue)
        {
            query = query.Where(p => p.CityId == request.CityId.Value);
        }

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
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
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        return items;
    }
}

public sealed class GetHelpFeedEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/help-posts/feed", async (Guid? cityId, IMediator mediator) =>
            {
                var result = await mediator.Send(new GetHelpFeedQuery(cityId));
                return Results.Ok(result);
            })
            .WithName("GetHelpFeed")
            .WithTags("HelpPosts");
    }
}
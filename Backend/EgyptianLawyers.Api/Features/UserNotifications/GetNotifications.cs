using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.UserNotifications;

// ── DTOs ─────────────────────────────────────────────────────────────────────

public sealed record NotificationDto(
    Guid Id,
    string Title,
    string Body,
    string? DataPayload,
    bool IsRead,
    DateTime CreatedAt
);

/// <summary>Extends PaginatedResult with the total unread count for badge display.</summary>
public sealed record NotificationsResult(
    IEnumerable<NotificationDto> Data,
    int TotalCount,
    int PageIndex,
    int PageSize,
    int UnreadCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasNextPage => PageIndex < TotalPages;
    public bool HasPreviousPage => PageIndex > 1;
}

// ── Query ─────────────────────────────────────────────────────────────────────

public sealed record GetNotificationsQuery(
    string IdentityUserId,
    int PageIndex = 1,
    int PageSize = 20
) : IRequest<NotificationsResult>;

// ── Handler ───────────────────────────────────────────────────────────────────

public sealed class GetNotificationsHandler
    : IRequestHandler<GetNotificationsQuery, NotificationsResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetNotificationsHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<NotificationsResult> Handle(
        GetNotificationsQuery request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var baseQuery = _dbContext.UserNotifications
            .AsNoTracking()
            .Where(n => n.LawyerId == lawyer.Id);

        var totalCount = await baseQuery.CountAsync(cancellationToken);
        var unreadCount = await baseQuery.CountAsync(n => !n.IsRead, cancellationToken);

        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var pageIndex = Math.Max(request.PageIndex, 1);

        var data = await baseQuery
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(n => new NotificationDto(
                n.Id, n.Title, n.Body, n.DataPayload, n.IsRead, n.CreatedAt))
            .ToListAsync(cancellationToken);

        return new NotificationsResult(data, totalCount, pageIndex, pageSize, unreadCount);
    }
}

// ── Endpoint ──────────────────────────────────────────────────────────────────

public sealed class GetNotificationsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/notifications",
                async (
                    HttpContext ctx,
                    IMediator mediator,
                    int pageIndex = 1,
                    int pageSize = 20) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    var result = await mediator.Send(
                        new GetNotificationsQuery(identityUserId, pageIndex, pageSize));
                    return Results.Ok(result);
                })
            .RequireAuthorization()
            .WithName("GetNotifications")
            .WithTags("Notifications");
    }
}

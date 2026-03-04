using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.UserNotifications;

// ── Command ───────────────────────────────────────────────────────────────────

public sealed record MarkAllNotificationsReadCommand(string IdentityUserId) : IRequest<Unit>;

// ── Handler ───────────────────────────────────────────────────────────────────

public sealed class MarkAllNotificationsReadHandler
    : IRequestHandler<MarkAllNotificationsReadCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public MarkAllNotificationsReadHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(
        MarkAllNotificationsReadCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        // Single bulk UPDATE — no round-trip to load individual entities
        await _dbContext.UserNotifications
            .Where(n => n.LawyerId == lawyer.Id && !n.IsRead)
            .ExecuteUpdateAsync(
                s => s.SetProperty(n => n.IsRead, true),
                cancellationToken);

        return Unit.Value;
    }
}

// ── Endpoint ──────────────────────────────────────────────────────────────────

public sealed class MarkAllNotificationsReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/read-all",
                async (HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    await mediator.Send(new MarkAllNotificationsReadCommand(identityUserId));
                    return Results.NoContent();
                })
            .RequireAuthorization()
            .WithName("MarkAllNotificationsRead")
            .WithTags("Notifications");
    }
}

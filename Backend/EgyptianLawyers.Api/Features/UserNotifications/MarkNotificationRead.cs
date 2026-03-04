using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.UserNotifications;

// ── Command ───────────────────────────────────────────────────────────────────

public sealed record MarkNotificationReadCommand(
    Guid NotificationId,
    string IdentityUserId
) : IRequest<Unit>;

// ── Handler ───────────────────────────────────────────────────────────────────

public sealed class MarkNotificationReadHandler
    : IRequestHandler<MarkNotificationReadCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public MarkNotificationReadHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(
        MarkNotificationReadCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .AsNoTracking()
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var notification = await _dbContext.UserNotifications
            .FirstOrDefaultAsync(
                n => n.Id == request.NotificationId && n.LawyerId == lawyer.Id,
                cancellationToken);

        if (notification is null)
            throw new NotFoundException(new NotFoundError("Notification", request.NotificationId));

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}

// ── Endpoint ──────────────────────────────────────────────────────────────────

public sealed class MarkNotificationReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/{id:guid}/read",
                async (Guid id, HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    await mediator.Send(new MarkNotificationReadCommand(id, identityUserId));
                    return Results.NoContent();
                })
            .RequireAuthorization()
            .WithName("MarkNotificationRead")
            .WithTags("Notifications");
    }
}

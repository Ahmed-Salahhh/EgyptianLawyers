using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Reply;

public sealed record DeleteHelpPostReplyCommand(Guid ReplyId, Guid LawyerId) : IRequest<Unit>;

public sealed class DeleteHelpPostReplyHandler : IRequestHandler<DeleteHelpPostReplyCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteHelpPostReplyHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteHelpPostReplyCommand request, CancellationToken cancellationToken)
    {
        var reply = await _dbContext.HelpPostReplies
            .FirstOrDefaultAsync(r => r.Id == request.ReplyId, cancellationToken);

        if (reply is null)
            throw new NotFoundException(new NotFoundError("HelpPostReply", request.ReplyId));

        if (reply.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You are not authorized to delete this reply.");

        reply.IsDeleted = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteHelpPostReplyEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(
                "/api/help-post-replies/{id:guid}",
                async (Guid id, HttpContext ctx, ApplicationDbContext db, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(identityUserId))
                        return Results.Unauthorized();

                    var lawyer = await db.Lawyers
                        .AsNoTracking()
                        .Where(l => l.IdentityUserId == identityUserId)
                        .Select(l => l.Id)
                        .FirstOrDefaultAsync(ctx.RequestAborted);

                    if (lawyer == default)
                        return Results.NotFound(new { message = "Lawyer profile not found." });

                    await mediator.Send(new DeleteHelpPostReplyCommand(id, lawyer));
                    return Results.NoContent();
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .WithName("DeleteHelpPostReplyUser")
            .WithTags("HelpPosts");
    }
}

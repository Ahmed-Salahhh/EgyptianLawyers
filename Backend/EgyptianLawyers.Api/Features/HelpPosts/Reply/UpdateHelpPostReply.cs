using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Reply;

public sealed record UpdateHelpPostReplyRequest(string Comment, string? AttachmentUrl);

public sealed record UpdateHelpPostReplyCommand(
    Guid ReplyId,
    Guid LawyerId,
    string Comment,
    string? AttachmentUrl
) : IRequest<Unit>;

public sealed class UpdateHelpPostReplyHandler : IRequestHandler<UpdateHelpPostReplyCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public UpdateHelpPostReplyHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(
        UpdateHelpPostReplyCommand request,
        CancellationToken cancellationToken)
    {
        var reply = await _dbContext.HelpPostReplies
            .FirstOrDefaultAsync(r => r.Id == request.ReplyId, cancellationToken);

        if (reply is null)
            throw new NotFoundException(new NotFoundError("HelpPostReply", request.ReplyId));

        if (reply.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You are not authorized to update this reply.");

        reply.Comment = request.Comment;
        reply.AttachmentUrl = request.AttachmentUrl;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class UpdateHelpPostReplyEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(
                "/api/help-post-replies/{id:guid}",
                async (
                    Guid id,
                    [FromBody] UpdateHelpPostReplyRequest body,
                    HttpContext ctx,
                    ApplicationDbContext db,
                    IMediator mediator) =>
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

                    await mediator.Send(
                        new UpdateHelpPostReplyCommand(id, lawyer, body.Comment, body.AttachmentUrl));

                    return Results.Ok(new { message = "Reply updated successfully." });
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .WithName("UpdateHelpPostReply")
            .WithTags("HelpPosts");
    }
}

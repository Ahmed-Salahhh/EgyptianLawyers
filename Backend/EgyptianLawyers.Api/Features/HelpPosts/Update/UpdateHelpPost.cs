using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Update;

public sealed record UpdateHelpPostRequest(string Description, string? AttachmentUrl);

public sealed record UpdateHelpPostCommand(Guid PostId, Guid LawyerId, string Description, string? AttachmentUrl)
    : IRequest<Unit>;

public sealed class UpdateHelpPostHandler : IRequestHandler<UpdateHelpPostCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public UpdateHelpPostHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(UpdateHelpPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _dbContext.HelpPosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.PostId));

        if (post.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You are not authorized to update this post.");

        post.Description = request.Description;
        post.AttachmentUrl = request.AttachmentUrl;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class UpdateHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(
                "/api/help-posts/{id:guid}",
                async (
                    Guid id,
                    [FromBody] UpdateHelpPostRequest body,
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
                        new UpdateHelpPostCommand(
                            id,
                            lawyer,
                            body.Description,
                            body.AttachmentUrl));

                    return Results.Ok(new { message = "Post updated successfully." });
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .WithName("UpdateHelpPost")
            .WithTags("HelpPosts");
    }
}

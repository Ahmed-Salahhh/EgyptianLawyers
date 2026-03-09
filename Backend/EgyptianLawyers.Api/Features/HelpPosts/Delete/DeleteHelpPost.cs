using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Delete;

public sealed record DeleteHelpPostCommand(Guid PostId, Guid LawyerId) : IRequest<Unit>;

public sealed class DeleteHelpPostHandler : IRequestHandler<DeleteHelpPostCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteHelpPostHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteHelpPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _dbContext.HelpPosts
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.PostId));

        if (post.LawyerId != request.LawyerId)
            throw new UnauthorizedAccessException("You are not authorized to delete this post.");

        post.IsDeleted = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete(
                "/api/help-posts/{id:guid}",
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

                    await mediator.Send(new DeleteHelpPostCommand(id, lawyer));
                    return Results.NoContent();
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .WithName("DeleteHelpPostUser")
            .WithTags("HelpPosts");
    }
}

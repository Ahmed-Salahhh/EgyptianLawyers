using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record DeleteHelpPostCommand(Guid Id) : IRequest<Unit>;

public sealed class DeleteHelpPostHandler : IRequestHandler<DeleteHelpPostCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteHelpPostHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteHelpPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _dbContext.HelpPosts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.Id));

        post.IsDeleted = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/admin/help-posts/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new DeleteHelpPostCommand(id));
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("DeleteHelpPost")
            .WithTags("Admin");
    }
}

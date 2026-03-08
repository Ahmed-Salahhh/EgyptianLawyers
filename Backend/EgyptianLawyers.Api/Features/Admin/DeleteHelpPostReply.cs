using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record DeleteHelpPostReplyCommand(Guid Id) : IRequest<Unit>;

public sealed class DeleteHelpPostReplyHandler : IRequestHandler<DeleteHelpPostReplyCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteHelpPostReplyHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteHelpPostReplyCommand request, CancellationToken cancellationToken)
    {
        var reply = await _dbContext.HelpPostReplies
            .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

        if (reply is null)
            throw new NotFoundException(new NotFoundError("HelpPostReply", request.Id));

        _dbContext.HelpPostReplies.Remove(reply);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteHelpPostReplyEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/admin/help-post-replies/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new DeleteHelpPostReplyCommand(id));
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("DeleteHelpPostReply")
            .WithTags("Admin");
    }
}

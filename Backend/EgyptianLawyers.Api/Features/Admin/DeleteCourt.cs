using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record DeleteCourtCommand(Guid Id) : IRequest<Unit>;

public sealed class DeleteCourtHandler : IRequestHandler<DeleteCourtCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteCourtHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteCourtCommand request, CancellationToken cancellationToken)
    {
        var court = await _dbContext.Courts
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (court is null)
            throw new NotFoundException(new NotFoundError("Court", request.Id));

        var hasCities = await _dbContext.Cities.AnyAsync(c => c.CourtId == request.Id, cancellationToken);
        if (hasCities)
            throw new FluentValidation.ValidationException(
                "Cannot delete a court that has cities. Delete its cities first.");

        var hasHelpPosts = await _dbContext.HelpPosts.AnyAsync(p => p.CourtId == request.Id, cancellationToken);
        if (hasHelpPosts)
            throw new FluentValidation.ValidationException(
                "Cannot delete a court that has existing help posts.");

        _dbContext.Courts.Remove(court);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteCourtEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/admin/courts/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new DeleteCourtCommand(id));
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("DeleteCourt")
            .WithTags("Admin");
    }
}

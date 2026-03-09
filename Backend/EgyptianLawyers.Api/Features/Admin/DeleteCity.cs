using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record DeleteCityCommand(Guid Id) : IRequest<Unit>;

public sealed class DeleteCityHandler : IRequestHandler<DeleteCityCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public DeleteCityHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(DeleteCityCommand request, CancellationToken cancellationToken)
    {
        var city = await _dbContext.Cities
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (city is null)
            throw new NotFoundException(new NotFoundError("City", request.Id));

        city.IsDeleted = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class DeleteCityEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/admin/cities/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new DeleteCityCommand(id));
                return Results.Ok(new { message = "City deleted successfully." });
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("DeleteCity")
            .WithTags("Admin");
    }
}

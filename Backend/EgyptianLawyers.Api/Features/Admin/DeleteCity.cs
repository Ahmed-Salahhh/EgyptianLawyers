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

        var hasCourts = await _dbContext.Courts.AnyAsync(c => c.CityId == request.Id, cancellationToken);
        if (hasCourts)
            throw new FluentValidation.ValidationException(
                "Cannot delete this city because it contains registered courts.");

        var hasHelpPosts = await _dbContext.HelpPosts.AnyAsync(p => p.CityId == request.Id, cancellationToken);
        if (hasHelpPosts)
            throw new FluentValidation.ValidationException(
                "Cannot delete a city that has existing help posts.");

        var hasActiveLawyers = await _dbContext.Lawyers
            .AnyAsync(l => l.ActiveCities.Any(c => c.Id == request.Id), cancellationToken);
        if (hasActiveLawyers)
            throw new FluentValidation.ValidationException(
                "Cannot delete a city that has active lawyers. Reassign them first.");

        _dbContext.Cities.Remove(city);
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
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("DeleteCity")
            .WithTags("Admin");
    }
}

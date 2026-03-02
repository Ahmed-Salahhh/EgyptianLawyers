using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record UpdateCityCommand(Guid Id, string Name) : IRequest<Unit>;

public sealed class UpdateCityValidator : AbstractValidator<UpdateCityCommand>
{
    public UpdateCityValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("City name is required.")
            .MaximumLength(200);
    }
}

public sealed class UpdateCityHandler : IRequestHandler<UpdateCityCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public UpdateCityHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(UpdateCityCommand request, CancellationToken cancellationToken)
    {
        var city = await _dbContext.Cities
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (city is null)
            throw new NotFoundException(new NotFoundError("City", request.Id));

        city.Name = request.Name;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class UpdateCityEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/admin/cities/{id:guid}", async (Guid id, UpdateCityCommand body, IMediator mediator) =>
            {
                await mediator.Send(body with { Id = id });
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("UpdateCity")
            .WithTags("Admin");
    }
}

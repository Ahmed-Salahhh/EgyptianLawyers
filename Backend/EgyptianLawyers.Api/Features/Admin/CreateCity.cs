using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record CreateCityCommand(string Name) : IRequest<CreateCityResult>;

public sealed record CreateCityResult(Guid Id, string Name);

public sealed class CreateCityValidator : AbstractValidator<CreateCityCommand>
{
    public CreateCityValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("City name is required.")
            .MaximumLength(200);
    }
}

public sealed class CreateCityHandler : IRequestHandler<CreateCityCommand, CreateCityResult>
{
    private readonly ApplicationDbContext _dbContext;

    public CreateCityHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<CreateCityResult> Handle(CreateCityCommand request, CancellationToken cancellationToken)
    {
        var alreadyExists = await _dbContext.Cities
            .AnyAsync(c => c.Name == request.Name, cancellationToken);
        if (alreadyExists)
            throw new FluentValidation.ValidationException(
                $"A city with the name '{request.Name}' already exists.");

        var city = new City { Id = Guid.NewGuid(), Name = request.Name };
        _dbContext.Cities.Add(city);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CreateCityResult(city.Id, city.Name);
    }
}

public sealed class CreateCityEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/cities", async (CreateCityCommand command, IMediator mediator) =>
            {
                var result = await mediator.Send(command);
                return Results.Created($"/api/admin/cities/{result.Id}", result);
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("CreateCity")
            .WithTags("Admin");
    }
}

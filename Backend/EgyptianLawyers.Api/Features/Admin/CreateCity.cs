using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record CreateCityCommand(Guid CourtId, string Name) : IRequest<CreateCityResult>;

public sealed record CreateCityResult(Guid Id, string Name, Guid CourtId);

public sealed class CreateCityValidator : AbstractValidator<CreateCityCommand>
{
    public CreateCityValidator()
    {
        RuleFor(x => x.CourtId).NotEmpty().WithMessage("CourtId is required.");
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
        var courtExists = await _dbContext.Courts.AnyAsync(c => c.Id == request.CourtId, cancellationToken);
        if (!courtExists)
            throw new NotFoundException(new NotFoundError("Court", request.CourtId));

        var alreadyExists = await _dbContext.Cities
            .AnyAsync(c => c.CourtId == request.CourtId && c.Name == request.Name, cancellationToken);
        if (alreadyExists)
            throw new FluentValidation.ValidationException(
                $"A city with the name '{request.Name}' already exists in this court.");

        var city = new City { Id = Guid.NewGuid(), Name = request.Name, CourtId = request.CourtId };
        _dbContext.Cities.Add(city);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CreateCityResult(city.Id, city.Name, city.CourtId);
    }
}

public sealed class CreateCityEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/courts/{courtId:guid}/cities",
                async (Guid courtId, CreateCityCommand body, IMediator mediator) =>
                {
                    var result = await mediator.Send(body with { CourtId = courtId });
                    return Results.Created($"/api/admin/cities/{result.Id}", result);
                })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("CreateCity")
            .WithTags("Admin");
    }
}

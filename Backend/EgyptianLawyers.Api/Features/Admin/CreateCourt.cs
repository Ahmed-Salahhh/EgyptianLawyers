using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record CreateCourtCommand(Guid CityId, string Name) : IRequest<CreateCourtResult>;

public sealed record CreateCourtResult(Guid Id, string Name, Guid CityId);

public sealed class CreateCourtValidator : AbstractValidator<CreateCourtCommand>
{
    public CreateCourtValidator()
    {
        RuleFor(x => x.CityId).NotEmpty().WithMessage("CityId is required.");
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Court name is required.")
            .MaximumLength(200);
    }
}

public sealed class CreateCourtHandler : IRequestHandler<CreateCourtCommand, CreateCourtResult>
{
    private readonly ApplicationDbContext _dbContext;

    public CreateCourtHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<CreateCourtResult> Handle(CreateCourtCommand request, CancellationToken cancellationToken)
    {
        var cityExists = await _dbContext.Cities.AnyAsync(c => c.Id == request.CityId, cancellationToken);
        if (!cityExists)
            throw new NotFoundException(new NotFoundError("City", request.CityId));

        var alreadyExists = await _dbContext.Courts
            .AnyAsync(c => c.CityId == request.CityId && c.Name == request.Name, cancellationToken);
        if (alreadyExists)
            throw new FluentValidation.ValidationException(
                $"A court with the name '{request.Name}' already exists in this city.");

        var court = new Court { Id = Guid.NewGuid(), Name = request.Name, CityId = request.CityId };
        _dbContext.Courts.Add(court);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new CreateCourtResult(court.Id, court.Name, court.CityId);
    }
}

public sealed class CreateCourtEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/admin/cities/{cityId:guid}/courts",
                async (Guid cityId, CreateCourtCommand body, IMediator mediator) =>
                {
                    var result = await mediator.Send(body with { CityId = cityId });
                    return Results.Created($"/api/admin/courts/{result.Id}", result);
                })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("CreateCourt")
            .WithTags("Admin");
    }
}

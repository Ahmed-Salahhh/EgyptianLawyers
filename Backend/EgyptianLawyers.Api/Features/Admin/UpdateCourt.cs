using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record UpdateCourtCommand(Guid Id, string Name) : IRequest<Unit>;

public sealed class UpdateCourtValidator : AbstractValidator<UpdateCourtCommand>
{
    public UpdateCourtValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Court name is required.")
            .MaximumLength(200);
    }
}

public sealed class UpdateCourtHandler : IRequestHandler<UpdateCourtCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public UpdateCourtHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(UpdateCourtCommand request, CancellationToken cancellationToken)
    {
        var court = await _dbContext.Courts
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (court is null)
            throw new NotFoundException(new NotFoundError("Court", request.Id));

        court.Name = request.Name;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class UpdateCourtEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/admin/courts/{id:guid}", async (Guid id, UpdateCourtCommand body, IMediator mediator) =>
            {
                await mediator.Send(body with { Id = id });
                return Results.NoContent();
            })
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("UpdateCourt")
            .WithTags("Admin");
    }
}

using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record ApproveLawyerCommand(Guid LawyerId) : IRequest<Unit>;

public sealed class ApproveLawyerValidator : AbstractValidator<ApproveLawyerCommand>
{
    public ApproveLawyerValidator()
    {
        RuleFor(x => x.LawyerId)
            .NotEmpty().WithMessage("LawyerId is required.");
    }
}

public sealed class ApproveLawyerHandler : IRequestHandler<ApproveLawyerCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public ApproveLawyerHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Unit> Handle(ApproveLawyerCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.Id == request.LawyerId, cancellationToken);

        if (lawyer is null)
        {
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));
        }

        if (!lawyer.IsVerified)
        {
            lawyer.IsVerified = true;
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}

public sealed class ApproveLawyerEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/admin/lawyers/{id:guid}/approve", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new ApproveLawyerCommand(id));
                return Results.NoContent();
            })
            .WithName("ApproveLawyer")
            .WithTags("Admin");
    }
}
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record SuspendLawyerCommand(Guid LawyerId, bool Suspend) : IRequest<Unit>;

public sealed class SuspendLawyerValidator : AbstractValidator<SuspendLawyerCommand>
{
    public SuspendLawyerValidator()
    {
        RuleFor(x => x.LawyerId).NotEmpty().WithMessage("LawyerId is required.");
    }
}

public sealed class SuspendLawyerHandler : IRequestHandler<SuspendLawyerCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public SuspendLawyerHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(SuspendLawyerCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.Id == request.LawyerId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        lawyer.IsSuspended = request.Suspend;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class SuspendLawyerEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        var auth = new AuthorizeAttribute { Roles = "Admin" };

        app.MapPut("/api/admin/lawyers/{id:guid}/suspend", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new SuspendLawyerCommand(id, Suspend: true));
                return Results.NoContent();
            })
            .RequireAuthorization(auth)
            .WithName("SuspendLawyer")
            .WithTags("Admin");

        app.MapPut("/api/admin/lawyers/{id:guid}/unsuspend", async (Guid id, IMediator mediator) =>
            {
                await mediator.Send(new SuspendLawyerCommand(id, Suspend: false));
                return Results.NoContent();
            })
            .RequireAuthorization(auth)
            .WithName("UnsuspendLawyer")
            .WithTags("Admin");
    }
}

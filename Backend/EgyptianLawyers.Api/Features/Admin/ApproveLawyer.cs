using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Services;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public sealed record ApproveLawyerCommand(Guid LawyerId) : IRequest<Unit>;

public sealed class ApproveLawyerValidator : AbstractValidator<ApproveLawyerCommand>
{
    public ApproveLawyerValidator()
    {
        RuleFor(x => x.LawyerId).NotEmpty().WithMessage("LawyerId is required.");
    }
}

public sealed class ApproveLawyerHandler : IRequestHandler<ApproveLawyerCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly INotificationService _notificationService;

    public ApproveLawyerHandler(
        ApplicationDbContext dbContext,
        INotificationService notificationService
    )
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
    }

    public async Task<Unit> Handle(
        ApproveLawyerCommand request,
        CancellationToken cancellationToken
    )
    {
        var lawyer = await _dbContext.Lawyers.FirstOrDefaultAsync(
            l => l.Id == request.LawyerId,
            cancellationToken
        );

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        lawyer.IsVerified = true;
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (!string.IsNullOrEmpty(lawyer.FcmToken))
        {
            await _notificationService.SendAccountApprovedNotificationAsync(
                lawyer.FcmToken,
                cancellationToken
            );
        }

        return Unit.Value;
    }
}

public sealed class ApproveLawyerEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut(
                "/api/admin/lawyers/{id:guid}/approve",
                async (Guid id, IMediator mediator) =>
                {
                    await mediator.Send(new ApproveLawyerCommand(id));
                    return Results.NoContent();
                }
            )
            .RequireAuthorization(new AuthorizeAttribute { Roles = "Admin" })
            .WithName("ApproveLawyer")
            .WithTags("Admin");
    }
}

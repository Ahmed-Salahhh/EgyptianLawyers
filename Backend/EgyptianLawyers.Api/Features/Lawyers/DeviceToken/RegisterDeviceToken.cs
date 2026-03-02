using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.DeviceToken;

public sealed record RegisterDeviceTokenRequest(string Token);

public sealed record RegisterDeviceTokenCommand(
    string IdentityUserId,
    string Token
) : IRequest<Unit>;

public sealed class RegisterDeviceTokenValidator : AbstractValidator<RegisterDeviceTokenCommand>
{
    public RegisterDeviceTokenValidator()
    {
        RuleFor(x => x.Token)
            .NotEmpty().WithMessage("FCM token is required.")
            .MaximumLength(500);
    }
}

public sealed class RegisterDeviceTokenHandler : IRequestHandler<RegisterDeviceTokenCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public RegisterDeviceTokenHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(RegisterDeviceTokenCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        lawyer.FcmToken = request.Token;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class RegisterDeviceTokenEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/lawyers/me/device-token",
                async (RegisterDeviceTokenRequest body, HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    var command = new RegisterDeviceTokenCommand(identityUserId, body.Token);
                    await mediator.Send(command);
                    return Results.NoContent();
                })
            .RequireAuthorization()
            .WithName("RegisterDeviceToken")
            .WithTags("Lawyers");
    }
}

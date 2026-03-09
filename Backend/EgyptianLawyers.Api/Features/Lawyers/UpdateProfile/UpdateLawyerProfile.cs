using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.UpdateProfile;

public sealed record UpdateLawyerProfileRequest(
    string? Title,
    string WhatsAppNumber,
    List<Guid> CityIds);

public sealed record UpdateLawyerProfileCommand(
    string IdentityUserId,
    string? Title,
    string WhatsAppNumber,
    List<Guid> CityIds
) : IRequest<Unit>;

public sealed class UpdateLawyerProfileValidator : AbstractValidator<UpdateLawyerProfileCommand>
{
    public UpdateLawyerProfileValidator()
    {

        RuleFor(x => x.CityIds)
            .NotEmpty().WithMessage("At least one active city is required.");

        RuleFor(x => x.Title)
            .MaximumLength(100)
            .When(x => x.Title != null);
    }
}

public sealed class UpdateLawyerProfileHandler : IRequestHandler<UpdateLawyerProfileCommand, Unit>
{
    private readonly ApplicationDbContext _dbContext;

    public UpdateLawyerProfileHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Unit> Handle(UpdateLawyerProfileCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .Include(l => l.ActiveCities)
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var cities = await _dbContext.Cities
            .Where(c => request.CityIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        if (cities.Count != request.CityIds.Count)
            throw new FluentValidation.ValidationException("One or more city IDs are invalid.");

        lawyer.Title = request.Title;
        lawyer.WhatsAppNumber = request.WhatsAppNumber;
        lawyer.ActiveCities = cities;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public sealed class UpdateLawyerProfileEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/lawyers/me", async (UpdateLawyerProfileRequest body, HttpContext ctx, IMediator mediator) =>
            {
                var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                var command = new UpdateLawyerProfileCommand(
                    identityUserId, body.Title, body.WhatsAppNumber, body.CityIds);
                await mediator.Send(command);
                return Results.NoContent();
            })
            .RequireAuthorization()
            .WithName("UpdateLawyerProfile")
            .WithTags("Lawyers");
    }
}

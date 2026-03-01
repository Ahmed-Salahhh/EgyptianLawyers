using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Register;

public record RegisterLawyerCommand(
    string FullName,
    string? Title,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    List<Guid> CityIds
) : IRequest<RegisterLawyerResult>;

public record RegisterLawyerResult(Guid Id);

public class RegisterLawyerValidator : AbstractValidator<RegisterLawyerCommand>
{
    private static readonly System.Text.RegularExpressions.Regex EgyptianWhatsAppRegex = new(
        @"^(\+20|0020|0)?1[0-2]\d{8}$",
        System.Text.RegularExpressions.RegexOptions.Compiled);

    public RegisterLawyerValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(200);

        RuleFor(x => x.SyndicateCardNumber)
            .NotEmpty().WithMessage("Syndicate card number is required.")
            .MaximumLength(50);

        RuleFor(x => x.WhatsAppNumber)
            .NotEmpty().WithMessage("WhatsApp number is required.")
            .Must(BeValidEgyptianWhatsApp).WithMessage("WhatsApp number must follow Egyptian format (+20 or 01...).");
    }

    private static bool BeValidEgyptianWhatsApp(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var normalized = value.Trim().Replace(" ", "");
        return EgyptianWhatsAppRegex.IsMatch(normalized);
    }
}

public class RegisterLawyerHandler : IRequestHandler<RegisterLawyerCommand, RegisterLawyerResult>
{
    private readonly ApplicationDbContext _db;

    public RegisterLawyerHandler(ApplicationDbContext db) => _db = db;

    public async Task<RegisterLawyerResult> Handle(RegisterLawyerCommand request, CancellationToken cancellationToken)
    {
        var cities = await _db.Cities
            .Where(c => request.CityIds.Contains(c.Id))
            .ToListAsync(cancellationToken);

        var lawyer = new Lawyer
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Title = request.Title,
            SyndicateCardNumber = request.SyndicateCardNumber,
            WhatsAppNumber = request.WhatsAppNumber,
            IsVerified = false,
            ActiveCities = cities,
            CreatedAt = DateTime.UtcNow
        };

        _db.Lawyers.Add(lawyer);
        await _db.SaveChangesAsync(cancellationToken);

        return new RegisterLawyerResult(lawyer.Id);
    }
}

public class RegisterLawyerEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/lawyers/register", async (RegisterLawyerCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/lawyers/{result.Id}", result);
        })
        .WithName("RegisterLawyer")
        .WithTags("Lawyers");
    }
}

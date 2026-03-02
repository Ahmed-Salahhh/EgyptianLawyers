using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Register;

public sealed record RegisterLawyerCommand(
    string FullName,
    string? Title,
    string SyndicateCardNumber,
    string WhatsAppNumber,
    List<Guid> CityIds,
    string Email,
    string Password
) : IRequest<RegisterLawyerResult>;

public sealed record RegisterLawyerResult(Guid Id);

public sealed class RegisterLawyerValidator : AbstractValidator<RegisterLawyerCommand>
{
    private static readonly System.Text.RegularExpressions.Regex EgyptianWhatsAppRegex = new(
        @"^(\+20|0020|0)?1[0-2]\d{8}$",
        System.Text.RegularExpressions.RegexOptions.Compiled | System.Text.RegularExpressions.RegexOptions.CultureInvariant);

    private static readonly System.Text.RegularExpressions.Regex StrongPasswordRegex = new(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$",
        System.Text.RegularExpressions.RegexOptions.Compiled | System.Text.RegularExpressions.RegexOptions.CultureInvariant);

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
            .Must(BeValidEgyptianWhatsApp)
            .WithMessage("WhatsApp number must follow Egyptian format (+20 or 01...).");

        RuleFor(x => x.CityIds)
            .NotNull()
            .Must(list => list.Count > 0)
            .WithMessage("At least one active city is required.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .Matches(StrongPasswordRegex)
            .WithMessage("Password must be at least 8 characters and contain upper, lower case letters and a digit.");
    }

    private static bool BeValidEgyptianWhatsApp(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var normalized = value.Trim().Replace(" ", string.Empty);
        return EgyptianWhatsAppRegex.IsMatch(normalized);
    }
}

public sealed class RegisterLawyerHandler : IRequestHandler<RegisterLawyerCommand, RegisterLawyerResult>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UserManager<ApplicationUser> _userManager;

    public RegisterLawyerHandler(ApplicationDbContext dbContext, UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    public async Task<RegisterLawyerResult> Handle(RegisterLawyerCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            throw new FluentValidation.ValidationException("A user with this email already exists.");
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = false
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            var failures = createResult.Errors
                .Select(e => new FluentValidation.Results.ValidationFailure("Identity", e.Description))
                .ToList();

            throw new FluentValidation.ValidationException(failures);
        }

        await _userManager.AddToRoleAsync(user, "Lawyer");

        var cities = await _dbContext.Cities
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
            CreatedAt = DateTime.UtcNow,
            IdentityUserId = user.Id,
            ActiveCities = cities
        };

        _dbContext.Lawyers.Add(lawyer);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new RegisterLawyerResult(lawyer.Id);
    }
}

public sealed class RegisterLawyerEndpoint : IEndpoint
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
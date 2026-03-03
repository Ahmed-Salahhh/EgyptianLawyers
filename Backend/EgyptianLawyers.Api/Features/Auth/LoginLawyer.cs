using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EgyptianLawyers.Api.Features.Auth;

public sealed record LoginCommand(string Email, string Password) : IRequest<LoginResult>;

public sealed record LoginResult(
    string Token,
    string Role,
    string FullName,
    bool IsVerified,
    bool IsSuspended,
    // Null for Admin users
    Guid? LawyerId);

public sealed class LoginValidator : AbstractValidator<LoginCommand>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
    }
}

public sealed class LoginHandler : IRequestHandler<LoginCommand, LoginResult>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public LoginHandler(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext dbContext,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<LoginResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
            throw new ValidationException("Invalid email or password.");

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!validPassword)
            throw new ValidationException("Invalid email or password.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Lawyer";

        string fullName;
        Guid? lawyerId = null;
        bool isVerified;
        bool isSuspended;

        if (role == "Admin")
        {
            fullName = user.UserName ?? user.Email ?? "Admin";
            isVerified = true;
            isSuspended = false;
        }
        else
        {
            var lawyer = await _dbContext.Lawyers
                .FirstOrDefaultAsync(l => l.IdentityUserId == user.Id, cancellationToken);

            if (lawyer is null)
                throw new ValidationException("Lawyer profile not found.");

            fullName = lawyer.FullName;
            lawyerId = lawyer.Id;
            isVerified = lawyer.IsVerified;
            isSuspended = lawyer.IsSuspended;
        }

        var tokenString = GenerateJwt(user, role, isVerified, isSuspended);

        return new LoginResult(tokenString, role, fullName, isVerified, isSuspended, lawyerId);
    }

    private string GenerateJwt(ApplicationUser user, string role, bool isVerified, bool isSuspended)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSection["Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, role),
            new("IsVerified", isVerified.ToString()),
            new("IsSuspended", isSuspended.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public sealed class LoginEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginCommand command, IMediator mediator) =>
            {
                var result = await mediator.Send(command);
                return Results.Ok(result);
            })
            .WithName("Login")
            .WithTags("Auth");
    }
}

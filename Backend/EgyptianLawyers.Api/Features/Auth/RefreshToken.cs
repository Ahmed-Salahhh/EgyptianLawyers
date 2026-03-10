using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EgyptianLawyers.Api.Features.Auth;

/// <summary>
/// Issues a new JWT with fresh claims (IsVerified, IsSuspended) from the database.
/// Use when the user's approval/suspension status changes without re-login.
/// </summary>
public sealed record RefreshTokenCommand(string IdentityUserId) : IRequest<RefreshTokenResult?>;

public sealed record RefreshTokenResult(
    string Token,
    string Role,
    string FullName,
    bool IsVerified,
    bool IsSuspended,
    Guid? LawyerId);

public sealed class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenResult?>
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public RefreshTokenHandler(
        UserManager<ApplicationUser> userManager,
        ApplicationDbContext dbContext,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _configuration = configuration;
    }

    public async Task<RefreshTokenResult?> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(request.IdentityUserId);
        if (user is null)
            return null;

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
                return null;

            fullName = lawyer.FullName;
            lawyerId = lawyer.Id;
            isVerified = lawyer.IsVerified;
            isSuspended = lawyer.IsSuspended;
        }

        var tokenString = GenerateJwt(user, role, isVerified, isSuspended);

        return new RefreshTokenResult(tokenString, role, fullName, isVerified, isSuspended, lawyerId);
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

public sealed class RefreshTokenEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(
                "/api/auth/refresh",
                async (HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(identityUserId))
                        return Results.Unauthorized();

                    var result = await mediator.Send(new RefreshTokenCommand(identityUserId));
                    if (result is null)
                        return Results.NotFound();

                    return Results.Ok(result);
                }
            )
            .RequireAuthorization()
            .WithName("RefreshToken")
            .WithTags("Auth");
    }
}

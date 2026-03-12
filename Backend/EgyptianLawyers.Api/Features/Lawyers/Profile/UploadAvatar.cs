using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using EgyptianLawyers.Api.Services;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Lawyers.Profile;

public sealed record UploadAvatarCommand(string IdentityUserId, IFormFile File) : IRequest<string>;

public sealed class UploadAvatarHandler : IRequestHandler<UploadAvatarCommand, string>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ICloudinaryService _cloudinaryService;

    public UploadAvatarHandler(
        ApplicationDbContext dbContext,
        ICloudinaryService cloudinaryService)
    {
        _dbContext = dbContext;
        _cloudinaryService = cloudinaryService;
    }

    public async Task<string> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var avatarUrl = await _cloudinaryService.UploadAsync(
            request.File,
            "lawyers/avatars",
            cancellationToken);

        lawyer.AvatarUrl = avatarUrl;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return avatarUrl;
    }
}

public sealed class UploadAvatarEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(
                "/api/lawyers/me/avatar",
                async (IFormFile? file, HttpContext ctx, IMediator mediator, CancellationToken ct) =>
                {
                    if (file is null || file.Length == 0)
                        return Results.BadRequest(new { error = "No file was uploaded." });

                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    if (string.IsNullOrEmpty(identityUserId))
                        return Results.Unauthorized();

                    var avatarUrl = await mediator.Send(new UploadAvatarCommand(identityUserId, file), ct);
                    return Results.Ok(new { avatarUrl });
                }
            )
            .RequireAuthorization()
            .DisableAntiforgery()
            .WithName("UploadAvatar")
            .WithTags("Lawyers");
    }
}

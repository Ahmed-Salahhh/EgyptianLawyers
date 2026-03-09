using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Services;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace EgyptianLawyers.Api.Features.HelpPosts.UploadAttachment;

public sealed record UploadAttachmentCommand(IFormFile File) : IRequest<string>;

public sealed class UploadAttachmentHandler : IRequestHandler<UploadAttachmentCommand, string>
{
    private readonly ICloudinaryService _cloudinaryService;

    public UploadAttachmentHandler(ICloudinaryService cloudinaryService) =>
        _cloudinaryService = cloudinaryService;

    public async Task<string> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        return await _cloudinaryService.UploadAsync(
            request.File,
            "lawyers/attachments",
            cancellationToken);
    }
}

public sealed class UploadAttachmentEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost(
                "/api/help-posts/upload-attachment",
                async (IFormFile? file, IMediator mediator, CancellationToken ct) =>
                {
                    if (file is null)
                        return Results.BadRequest(new { error = "No file was uploaded." });
                    var url = await mediator.Send(new UploadAttachmentCommand(file), ct);
                    return Results.Ok(new { url });
                }
            )
            .RequireAuthorization(PolicyNames.RequireActive)
            .DisableAntiforgery()
            .WithName("UploadAttachment")
            .WithTags("HelpPosts");
    }
}

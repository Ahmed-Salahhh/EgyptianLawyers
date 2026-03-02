using System.Security.Claims;
using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Reply;

// Body sent by the mobile client — no LawyerId (resolved from JWT)
public sealed record ReplyToPostRequest(string? Comment, string? AttachmentUrl);

public sealed record ReplyToPostCommand(
    Guid HelpPostId,
    string IdentityUserId,
    string? Comment,
    string? AttachmentUrl
) : IRequest<ReplyToPostResult>;

public sealed record ReplyToPostResult(Guid Id);

public sealed class ReplyToPostValidator : AbstractValidator<ReplyToPostCommand>
{
    public ReplyToPostValidator()
    {
        RuleFor(x => x.HelpPostId).NotEmpty().WithMessage("HelpPostId is required.");

        RuleFor(x => x).Must(x => x.Comment != null || x.AttachmentUrl != null)
            .WithMessage("A reply must include a comment or an attachment.");

        RuleFor(x => x.Comment).MaximumLength(2000).When(x => x.Comment != null);
        RuleFor(x => x.AttachmentUrl).MaximumLength(1000).When(x => x.AttachmentUrl != null);
    }
}

public sealed class ReplyToPostHandler : IRequestHandler<ReplyToPostCommand, ReplyToPostResult>
{
    private readonly ApplicationDbContext _dbContext;

    public ReplyToPostHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<ReplyToPostResult> Handle(ReplyToPostCommand request, CancellationToken cancellationToken)
    {
        var post = await _dbContext.HelpPosts
            .FirstOrDefaultAsync(p => p.Id == request.HelpPostId, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.HelpPostId));

        var lawyer = await _dbContext.Lawyers
            .FirstOrDefaultAsync(l => l.IdentityUserId == request.IdentityUserId, cancellationToken);

        if (lawyer is null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.IdentityUserId));

        var reply = new HelpPostReply
        {
            Id = Guid.NewGuid(),
            HelpPostId = request.HelpPostId,
            LawyerId = lawyer.Id,
            Comment = request.Comment,
            AttachmentUrl = request.AttachmentUrl,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.HelpPostReplies.Add(reply);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ReplyToPostResult(reply.Id);
    }
}

public sealed class ReplyToPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/help-posts/{helpPostId:guid}/replies",
                async (Guid helpPostId, ReplyToPostRequest body, HttpContext ctx, IMediator mediator) =>
                {
                    var identityUserId = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
                    var command = new ReplyToPostCommand(helpPostId, identityUserId, body.Comment, body.AttachmentUrl);
                    var result = await mediator.Send(command);
                    return Results.Created($"/api/help-posts/{helpPostId}/replies/{result.Id}", result);
                })
            .RequireAuthorization()
            .WithName("ReplyToPost")
            .WithTags("HelpPosts");
    }
}

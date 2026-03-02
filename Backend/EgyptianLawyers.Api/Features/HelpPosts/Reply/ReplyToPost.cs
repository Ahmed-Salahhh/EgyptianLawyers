using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Reply;

public sealed record ReplyToPostCommand(
    Guid HelpPostId,
    Guid LawyerId,
    string? Comment,
    string? AttachmentUrl
) : IRequest<ReplyToPostResult>;

public sealed record ReplyToPostResult(Guid Id);

public sealed class ReplyToPostValidator : AbstractValidator<ReplyToPostCommand>
{
    public ReplyToPostValidator()
    {
        RuleFor(x => x.HelpPostId)
            .NotEmpty().WithMessage("HelpPostId is required.");

        RuleFor(x => x.LawyerId)
            .NotEmpty().WithMessage("LawyerId is required.");

        RuleFor(x => x.Comment)
            .MaximumLength(2000)
            .When(x => x.Comment != null);

        RuleFor(x => x.AttachmentUrl)
            .MaximumLength(1000)
            .When(x => x.AttachmentUrl != null);
    }
}

public sealed class ReplyToPostHandler : IRequestHandler<ReplyToPostCommand, ReplyToPostResult>
{
    private readonly ApplicationDbContext _dbContext;

    public ReplyToPostHandler(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ReplyToPostResult> Handle(ReplyToPostCommand request, CancellationToken cancellationToken)
    {
        var postExists = await _dbContext.HelpPosts
            .AnyAsync(p => p.Id == request.HelpPostId, cancellationToken);

        if (!postExists)
        {
            throw new NotFoundException(new NotFoundError("HelpPost", request.HelpPostId));
        }

        var lawyerExists = await _dbContext.Lawyers
            .AnyAsync(l => l.Id == request.LawyerId, cancellationToken);

        if (!lawyerExists)
        {
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));
        }

        var reply = new HelpPostReply
        {
            Id = Guid.NewGuid(),
            HelpPostId = request.HelpPostId,
            LawyerId = request.LawyerId,
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
        app.MapPost("/api/help-posts/{helpPostId:guid}/replies", async (Guid helpPostId, ReplyToPostCommand body, IMediator mediator) =>
            {
                var command = body with { HelpPostId = helpPostId };
                var result = await mediator.Send(command);
                return Results.Created($"/api/help-posts/{helpPostId}/replies/{result.Id}", result);
            })
            .WithName("ReplyToPost")
            .WithTags("HelpPosts");
    }
}
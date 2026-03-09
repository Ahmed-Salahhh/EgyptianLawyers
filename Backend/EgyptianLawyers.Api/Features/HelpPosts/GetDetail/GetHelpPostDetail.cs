using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Common;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.GetDetail;

public sealed record GetHelpPostDetailQuery(Guid PostId) : IRequest<HelpPostDetailResult>;

public sealed record HelpPostReplyDto(
    Guid Id,
    Guid LawyerId,
    string LawyerFullName,
    string LawyerWhatsAppNumber,
    Guid? ParentReplyId,
    string? Comment,
    string? AttachmentUrl,
    DateTime CreatedAt,
    List<HelpPostReplyDto> ChildReplies);

public sealed record HelpPostDetailResult(
    Guid Id,
    string Description,
    string? AttachmentUrl,
    Guid CourtId,
    string CourtName,
    Guid CityId,
    string CityName,
    Guid LawyerId,
    string LawyerFullName,
    string LawyerWhatsAppNumber,
    DateTime CreatedAt,
    List<HelpPostReplyDto> Replies);

public sealed class GetHelpPostDetailHandler : IRequestHandler<GetHelpPostDetailQuery, HelpPostDetailResult>
{
    private readonly ApplicationDbContext _dbContext;

    public GetHelpPostDetailHandler(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<HelpPostDetailResult> Handle(GetHelpPostDetailQuery request, CancellationToken cancellationToken)
    {
        var post = await _dbContext.HelpPosts
            .Include(p => p.Court)
            .Include(p => p.City)
            .Include(p => p.Lawyer)
            .Include(p => p.Replies.Where(r => r.ParentReplyId == null))
                .ThenInclude(r => r.Lawyer)
            .Include(p => p.Replies.Where(r => r.ParentReplyId == null))
                .ThenInclude(r => r.ChildReplies)
                .ThenInclude(c => c.Lawyer)
            .FirstOrDefaultAsync(p => p.Id == request.PostId, cancellationToken);

        if (post is null)
            throw new NotFoundException(new NotFoundError("HelpPost", request.PostId));

        var replies = post.Replies
            .Where(r => r.ParentReplyId == null)
            .OrderBy(r => r.CreatedAt)
            .Select(r => MapToReplyDto(r))
            .ToList();

        return new HelpPostDetailResult(
            post.Id,
            post.Description,
            post.AttachmentUrl,
            post.CourtId,
            post.Court.Name,
            post.CityId,
            post.City.Name,
            post.LawyerId,
            post.Lawyer.FullName,
            post.Lawyer.WhatsAppNumber,
            post.CreatedAt,
            replies);
    }

    private static HelpPostReplyDto MapToReplyDto(Domain.Entities.HelpPostReply r)
    {
        var children = r.ChildReplies
            .OrderBy(c => c.CreatedAt)
            .Select(c => MapToReplyDto(c))
            .ToList();

        return new HelpPostReplyDto(
            r.Id,
            r.LawyerId,
            r.Lawyer.FullName,
            r.Lawyer.WhatsAppNumber,
            r.ParentReplyId,
            r.Comment,
            r.AttachmentUrl,
            r.CreatedAt,
            children);
    }
}

public sealed class GetHelpPostDetailEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/help-posts/{id:guid}", async (Guid id, IMediator mediator) =>
            {
                var result = await mediator.Send(new GetHelpPostDetailQuery(id));
                return Results.Ok(result);
            })
            .RequireAuthorization(PolicyNames.RequireVerified)
            .WithName("GetHelpPostDetail")
            .WithTags("HelpPosts");
    }
}

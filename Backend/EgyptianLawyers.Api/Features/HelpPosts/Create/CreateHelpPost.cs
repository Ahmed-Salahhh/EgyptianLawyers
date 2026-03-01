using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using EgyptianLawyers.Api.Errors;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.HelpPosts.Create;

public record CreateHelpPostCommand(
    string Description,
    Guid CourtId,
    Guid CityId,
    Guid LawyerId
) : IRequest<CreateHelpPostResult>;

public record CreateHelpPostResult(Guid Id);

public class CreateHelpPostValidator : AbstractValidator<CreateHelpPostCommand>
{
    public CreateHelpPostValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(2000);

        RuleFor(x => x.CourtId)
            .NotEmpty().WithMessage("Court is required.");

        RuleFor(x => x.CityId)
            .NotEmpty().WithMessage("City is required.");

        RuleFor(x => x.LawyerId)
            .NotEmpty().WithMessage("Lawyer is required.");
    }
}

public class CreateHelpPostHandler : IRequestHandler<CreateHelpPostCommand, CreateHelpPostResult>
{
    private readonly ApplicationDbContext _db;

    public CreateHelpPostHandler(ApplicationDbContext db) => _db = db;

    public async Task<CreateHelpPostResult> Handle(CreateHelpPostCommand request, CancellationToken cancellationToken)
    {
        var courtExists = await _db.Courts.AnyAsync(c => c.Id == request.CourtId, cancellationToken);
        if (!courtExists)
            throw new NotFoundException(new NotFoundError("Court", request.CourtId));

        var cityExists = await _db.Cities.AnyAsync(c => c.Id == request.CityId && c.CourtId == request.CourtId, cancellationToken);
        if (!cityExists)
            throw new NotFoundException(new NotFoundError("City", request.CityId));

        var lawyerExists = await _db.Lawyers.AnyAsync(l => l.Id == request.LawyerId, cancellationToken);
        if (!lawyerExists)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        var helpPost = new HelpPost
        {
            Id = Guid.NewGuid(),
            Description = request.Description,
            CourtId = request.CourtId,
            CityId = request.CityId,
            LawyerId = request.LawyerId,
            CreatedAt = DateTime.UtcNow
        };

        _db.HelpPosts.Add(helpPost);
        await _db.SaveChangesAsync(cancellationToken);

        return new CreateHelpPostResult(helpPost.Id);
    }
}

public class CreateHelpPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/help-posts", async (CreateHelpPostCommand command, IMediator mediator) =>
        {
            var result = await mediator.Send(command);
            return Results.Created($"/api/help-posts/{result.Id}", result);
        })
        .WithName("CreateHelpPost")
        .WithTags("HelpPosts");
    }
}

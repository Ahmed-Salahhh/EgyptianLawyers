using EgyptianLawyers.Api.Abstractions;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Errors;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Features.Admin;

public record ApproveLawyerCommand(Guid LawyerId) : IRequest<bool>;

public class ApproveLawyerHandler : IRequestHandler<ApproveLawyerCommand, bool>
{
    private readonly ApplicationDbContext _db;

    public ApproveLawyerHandler(ApplicationDbContext db) => _db = db;

    public async Task<bool> Handle(ApproveLawyerCommand request, CancellationToken cancellationToken)
    {
        var lawyer = await _db.Lawyers.FindAsync([request.LawyerId], cancellationToken);
        
        if (lawyer == null)
            throw new NotFoundException(new NotFoundError("Lawyer", request.LawyerId));

        lawyer.IsVerified = true;
        await _db.SaveChangesAsync(cancellationToken);

        return true;
    }
}

public class ApproveLawyerEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/admin/lawyers/{id:guid}/approve", async (Guid id, IMediator mediator) =>
        {
            await mediator.Send(new ApproveLawyerCommand(id));
            return Results.NoContent();
        })
        .WithName("ApproveLawyer")
        .WithTags("Admin");
    }
}
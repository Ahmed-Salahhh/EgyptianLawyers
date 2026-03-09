namespace EgyptianLawyers.Api.Domain.Entities;

public class HelpPost
{
    public Guid Id { get; set; }
    public required string Description { get; set; }
    public string? AttachmentUrl { get; set; }
    public Guid CourtId { get; set; }
    public Guid CityId { get; set; }
    public Guid LawyerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    public Court Court { get; set; } = null!;
    public City City { get; set; } = null!;
    public Lawyer Lawyer { get; set; } = null!;
    public List<HelpPostReply> Replies { get; set; } = [];
}

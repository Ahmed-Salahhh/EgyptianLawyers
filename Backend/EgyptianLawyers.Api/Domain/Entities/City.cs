namespace EgyptianLawyers.Api.Domain.Entities;

public class City
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid CourtId { get; set; }

    public Court Court { get; set; } = null!;
    public List<HelpPost> HelpPosts { get; set; } = [];
    public List<Lawyer> ActiveLawyers { get; set; } = [];
}

namespace EgyptianLawyers.Api.Domain.Entities;

public class Court
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public Guid CityId { get; set; }

    public City City { get; set; } = null!;
    public List<HelpPost> HelpPosts { get; set; } = [];
}

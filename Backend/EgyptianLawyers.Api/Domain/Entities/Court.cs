namespace EgyptianLawyers.Api.Domain.Entities;

public class Court
{
    public Guid Id { get; set; }
    public required string Name { get; set; }

    public List<City> Cities { get; set; } = [];
    public List<HelpPost> HelpPosts { get; set; } = [];
}

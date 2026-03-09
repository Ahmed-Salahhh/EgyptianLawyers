namespace EgyptianLawyers.Api.Domain.Entities;

public class City
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsDeleted { get; set; } = false;

    public List<Court> Courts { get; set; } = [];
    public List<HelpPost> HelpPosts { get; set; } = [];
    public List<Lawyer> ActiveLawyers { get; set; } = [];
}

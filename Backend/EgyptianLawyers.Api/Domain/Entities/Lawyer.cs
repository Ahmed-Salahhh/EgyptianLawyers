namespace EgyptianLawyers.Api.Domain.Entities;

public class Lawyer
{
    public Guid Id { get; set; }
    public required string FullName { get; set; }
    public string? Title { get; set; }
    public required string SyndicateCardNumber { get; set; }
    public required string WhatsAppNumber { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; }

    public List<City> ActiveCities { get; set; } = [];
    public List<HelpPost> HelpPosts { get; set; } = [];
    public List<HelpPostReply> HelpPostReplies { get; set; } = [];
}

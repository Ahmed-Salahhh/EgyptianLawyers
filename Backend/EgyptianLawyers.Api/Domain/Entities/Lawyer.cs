namespace EgyptianLawyers.Api.Domain.Entities;

public class Lawyer
{
    public Guid Id { get; set; }
    public required string FullName { get; set; }
    public string? Title { get; set; }
    public required string SyndicateCardNumber { get; set; }
    public required string WhatsAppNumber { get; set; }
    public bool IsVerified { get; set; } = false;
    public bool IsSuspended { get; set; } = false;
    public DateTime CreatedAt { get; set; }
    public required string IdentityUserId { get; set; }
    public string? FcmToken { get; set; }

    public List<City> ActiveCities { get; set; } = [];
    public List<HelpPost> HelpPosts { get; set; } = [];
    public List<HelpPostReply> HelpPostReplies { get; set; } = [];
    public List<UserNotification> Notifications { get; set; } = [];

    // Profile view tracking
    public List<ProfileView> ProfileViewsReceived { get; set; } = [];
}

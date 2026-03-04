namespace EgyptianLawyers.Api.Domain.Entities;

public sealed class ProfileView
{
    public Guid Id { get; set; }

    public Guid ViewerId { get; set; }
    public Lawyer Viewer { get; set; } = null!;

    public Guid ViewedId { get; set; }
    public Lawyer Viewed { get; set; } = null!;

    /// <summary>Cumulative count of visits from this viewer to this profile.</summary>
    public int ViewCount { get; set; } = 1;

    public DateTime LastViewedAt { get; set; }
}

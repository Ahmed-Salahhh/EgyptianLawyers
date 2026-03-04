namespace EgyptianLawyers.Api.Domain.Entities;

public sealed class UserNotification
{
    public Guid Id { get; set; }

    public Guid LawyerId { get; set; }
    public Lawyer Lawyer { get; set; } = null!;

    public required string Title { get; set; }
    public required string Body { get; set; }

    /// <summary>
    /// Optional JSON string carrying routing data, e.g. {"postId":"…"}.
    /// Clients parse this to navigate to the correct screen.
    /// </summary>
    public string? DataPayload { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

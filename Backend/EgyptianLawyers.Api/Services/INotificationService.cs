namespace EgyptianLawyers.Api.Services;

public interface INotificationService
{
    Task SendNewPostNotificationAsync(
        Guid postId,
        string description,
        Guid cityId,
        CancellationToken cancellationToken
    );

    /// <param name="lawyerId">Required to persist the in-app notification record.</param>
    /// <param name="fcmToken">Optional — FCM push is skipped when null.</param>
    Task SendAccountApprovedNotificationAsync(
        Guid lawyerId,
        string? fcmToken,
        CancellationToken cancellationToken
    );

    /// <summary>
    /// Notifies the author of a help post that someone left a new comment.
    /// No-ops silently when the commenter IS the post author.
    /// </summary>
    /// <param name="postAuthorId">LawyerId of the post author (notification recipient).</param>
    /// <param name="postId">Used to build the DataPayload for deep-linking.</param>
    /// <param name="commenterName">Displayed in the notification body.</param>
    /// <param name="authorFcmToken">Optional — FCM push is skipped when null or empty.</param>
    Task SendCommentNotificationAsync(
        Guid postAuthorId,
        Guid postId,
        string commenterName,
        string? authorFcmToken,
        CancellationToken cancellationToken
    );
}

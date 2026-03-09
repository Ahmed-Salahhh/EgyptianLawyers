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
    /// Notifies the target user that someone commented or replied.
    /// No-ops silently when the commenter IS the target (caller must check).
    /// </summary>
    /// <param name="targetUserId">LawyerId of the notification recipient.</param>
    /// <param name="postId">Used to build the DataPayload for deep-linking.</param>
    /// <param name="commenterName">Name of the user who commented/replied.</param>
    /// <param name="targetFcmToken">Optional — FCM push is skipped when null or empty.</param>
    /// <param name="notificationBody">The text/body of the push notification (e.g. "X commented on your post").</param>
    Task SendCommentNotificationAsync(
        Guid targetUserId,
        Guid postId,
        string commenterName,
        string? targetFcmToken,
        string notificationBody,
        CancellationToken cancellationToken
    );
}

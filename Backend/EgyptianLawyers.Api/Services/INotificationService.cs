namespace EgyptianLawyers.Api.Services;

public interface INotificationService
{
    Task SendNewPostNotificationAsync(
        Guid postId,
        string description,
        Guid cityId,
        CancellationToken cancellationToken
    );

    Task SendAccountApprovedNotificationAsync(string fcmToken, CancellationToken cancellationToken);
}

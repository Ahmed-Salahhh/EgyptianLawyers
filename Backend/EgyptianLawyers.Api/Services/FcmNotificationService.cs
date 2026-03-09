using System.Text.Json;
using EgyptianLawyers.Api.Data;
using EgyptianLawyers.Api.Domain.Entities;
using FirebaseAdmin.Messaging;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Services;

public sealed class FcmNotificationService : INotificationService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<FcmNotificationService> _logger;

    public FcmNotificationService(
        ApplicationDbContext dbContext,
        ILogger<FcmNotificationService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    // ── New post ──────────────────────────────────────────────────────────────

    public async Task SendNewPostNotificationAsync(
        Guid postId,
        string description,
        Guid cityId,
        CancellationToken cancellationToken)
    {
        const string title = "New Help Request";

        // Fetch ALL eligible lawyers (verified, active in city).
        // We need IDs for in-app records and FCM tokens for push.
        var recipients = await _dbContext.Lawyers
            .Where(l =>
                l.IsVerified &&
                !l.IsSuspended &&
                l.ActiveCities.Any(c => c.Id == cityId))
            .Select(l => new { l.Id, l.FcmToken })
            .ToListAsync(cancellationToken);

        if (recipients.Count == 0)
        {
            _logger.LogInformation(
                "No eligible lawyers found for city {CityId}. Skipping notification.", cityId);
            return;
        }

        // ── Persist in-app notifications for every recipient ─────────────────
        var body = description.Length > 150 ? string.Concat(description.AsSpan(0, 150), "…") : description;
        var dataPayload = JsonSerializer.Serialize(new { postId = postId.ToString() });

        var inAppRecords = recipients.Select(r => new UserNotification
        {
            Id = Guid.NewGuid(),
            LawyerId = r.Id,
            Title = title,
            Body = body,
            DataPayload = dataPayload,
            CreatedAt = DateTime.UtcNow,
        }).ToList();

        _dbContext.UserNotifications.AddRange(inAppRecords);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Saved {Count} in-app notifications for post {PostId}.", inAppRecords.Count, postId);

        // ── Send FCM push to recipients who have a device token ───────────────
        var tokens = recipients
            .Where(r => r.FcmToken != null)
            .Select(r => r.FcmToken!)
            .ToList();

        if (tokens.Count == 0)
        {
            _logger.LogInformation(
                "No FCM tokens available for city {CityId}. Push skipped.", cityId);
            return;
        }

        var message = new MulticastMessage
        {
            Tokens = tokens,
            Notification = new Notification { Title = title, Body = description },
            Data = new Dictionary<string, string> { ["postId"] = postId.ToString() },
        };

        await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message, cancellationToken);

        _logger.LogInformation(
            "FCM push queued for post {PostId} to {Count} devices in city {CityId}.",
            postId, tokens.Count, cityId);
    }

    // ── Account approved ──────────────────────────────────────────────────────

    public async Task SendAccountApprovedNotificationAsync(
        Guid lawyerId,
        string? fcmToken,
        CancellationToken cancellationToken)
    {
        const string title = "Account Verified ✅";
        const string body =
            "Your account has been approved by the admin. You can now view and accept help requests!";

        // ── Persist in-app notification ───────────────────────────────────────
        _dbContext.UserNotifications.Add(new UserNotification
        {
            Id = Guid.NewGuid(),
            LawyerId = lawyerId,
            Title = title,
            Body = body,
            DataPayload = null,
            CreatedAt = DateTime.UtcNow,
        });
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Saved approval in-app notification for lawyer {LawyerId}.", lawyerId);

        // ── FCM push (optional) ───────────────────────────────────────────────
        if (string.IsNullOrEmpty(fcmToken))
        {
            _logger.LogInformation(
                "Lawyer {LawyerId} has no FCM token. Push skipped.", lawyerId);
            return;
        }

        var message = new Message
        {
            Token = fcmToken,
            Notification = new Notification { Title = title, Body = body },
        };

        await FirebaseMessaging.DefaultInstance.SendAsync(message, cancellationToken);

        _logger.LogInformation(
            "FCM approval push sent for lawyer {LawyerId}.", lawyerId);
    }

    // ── New comment on post ───────────────────────────────────────────────────

    public async Task SendCommentNotificationAsync(
        Guid targetUserId,
        Guid postId,
        string commenterName,
        string? targetFcmToken,
        string notificationBody,
        CancellationToken cancellationToken)
    {
        const string title = "New Comment";
        var dataPayload = JsonSerializer.Serialize(new { postId = postId.ToString() });

        // ── Persist in-app notification ───────────────────────────────────────
        _dbContext.UserNotifications.Add(new UserNotification
        {
            Id = Guid.NewGuid(),
            LawyerId = targetUserId,
            Title = title,
            Body = notificationBody,
            DataPayload = dataPayload,
            CreatedAt = DateTime.UtcNow,
        });
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Saved comment in-app notification for lawyer {LawyerId} on post {PostId}.",
            targetUserId, postId);

        // ── FCM push (optional) ───────────────────────────────────────────────
        if (string.IsNullOrEmpty(targetFcmToken))
        {
            _logger.LogInformation(
                "Target user {LawyerId} has no FCM token. Push skipped.", targetUserId);
            return;
        }

        var message = new Message
        {
            Token = targetFcmToken,
            Notification = new Notification { Title = title, Body = notificationBody },
            Data = new Dictionary<string, string> { ["postId"] = postId.ToString() },
        };

        await FirebaseMessaging.DefaultInstance.SendAsync(message, cancellationToken);

        _logger.LogInformation(
            "FCM comment push sent to lawyer {LawyerId} for post {PostId}.",
            targetUserId, postId);
    }
}

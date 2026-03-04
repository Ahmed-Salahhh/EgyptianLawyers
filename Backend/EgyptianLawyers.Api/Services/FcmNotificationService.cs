using EgyptianLawyers.Api.Data;
using FirebaseAdmin.Messaging;
using Microsoft.EntityFrameworkCore;

namespace EgyptianLawyers.Api.Services;

public sealed class FcmNotificationService : INotificationService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<FcmNotificationService> _logger;

    public FcmNotificationService(ApplicationDbContext dbContext, ILogger<FcmNotificationService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task SendNewPostNotificationAsync(
        Guid postId,
        string description,
        Guid cityId,
        CancellationToken cancellationToken)
    {
        // Collect FCM tokens of all verified, non-suspended lawyers active in this city
        var tokens = await _dbContext.Lawyers
            .Where(l => l.IsVerified
                        && !l.IsSuspended
                        && l.FcmToken != null
                        && l.ActiveCities.Any(c => c.Id == cityId))
            .Select(l => l.FcmToken!)
            .ToListAsync(cancellationToken);

        if (tokens.Count == 0)
        {
            _logger.LogInformation("No FCM tokens found for city {CityId}. Skipping notification.", cityId);
            return;
        }

          var message = new MulticastMessage
          {
              Tokens = tokens,
              Notification = new Notification { Title = "New Help Request", Body = description },
              Data = new Dictionary<string, string> { ["postId"] = postId.ToString() }
          };
          await FirebaseMessaging.DefaultInstance.SendEachForMulticastAsync(message, cancellationToken);

        _logger.LogInformation(
            "Push notification queued for post {PostId} to {Count} lawyers in city {CityId}.",
            postId, tokens.Count, cityId);
    }
}

namespace EgyptianLawyers.Api.Common;

/// <summary>
/// Centralised policy name constants — use these instead of raw strings on every endpoint.
/// </summary>
public static class PolicyNames
{
    /// <summary>
    /// Account must be verified by an admin.
    /// Unverified lawyers are rejected; suspended lawyers are still allowed (read-only access).
    /// Admins always pass.
    /// </summary>
    public const string RequireVerified = "RequireVerified";

    /// <summary>
    /// Account must be verified AND not suspended.
    /// Required for all write operations (create post, reply, etc.).
    /// Admins always pass.
    /// </summary>
    public const string RequireActive = "RequireActive";
}

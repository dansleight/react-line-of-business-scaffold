using System.Security.Claims;

namespace Scaffold;

public static class IdentityExtensions
{
    private static readonly string[] PersonIdClaimTypes =
        ["employeeid", "san", "email", "preferred_username", "oid", "name"];
    private static readonly string[] EmailClaimTypes =
        ["email", "preferred_username", "upn", "unique_name"];
    private static readonly string[] NameClaimTypes =
        ["name", "given_name"];

    public static string GetPersonId(this ClaimsPrincipal user) =>
        user.FindPersonId()
        ?? throw new UnauthorizedAccessException($"User claims do not contain a claim that can be used as an identifier, checked:{string.Join(", ", PersonIdClaimTypes)}");

    public static string? FindPersonId(this ClaimsPrincipal? user)
    {
        if (user is null)
            return null;

        foreach (string type in PersonIdClaimTypes)
        {
            Claim? claim = user.Claims.FirstOrDefault(c =>
                c.Type.Equals(type, StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(c.Value));
            if (claim != null)
                return claim.Value;
        }

        return null;
    }

    public static string? FindEmail(this ClaimsPrincipal? user)
    {
        if (user is null)
            return null;

        foreach (string type in EmailClaimTypes)
        {
            Claim? claim = user.Claims.FirstOrDefault(c =>
                c.Type.Equals(type, StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(c.Value)
                && c.Value.Contains('@'));
            if (claim != null)
                return claim.Value;
        }

        return null;
    }

    public static string? FindDisplayName(this ClaimsPrincipal? user)
    {
        if (user is null)
            return null;

        foreach (string type in NameClaimTypes)
        {
            Claim? claim = user.Claims.FirstOrDefault(c =>
                c.Type.Equals(type, StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(c.Value));
            if (claim != null)
                return claim.Value;
        }

        string? given = user.FindFirst("given_name")?.Value;
        string? family = user.FindFirst("family_name")?.Value;
        if (!string.IsNullOrWhiteSpace(given) && !string.IsNullOrWhiteSpace(family))
            return $"{given} {family}";

        return null;
    }
}
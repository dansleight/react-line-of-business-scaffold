using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Graph;
using Scaffold.Business;

namespace Scaffold.Services;

public class AvatarService
{
    public static readonly TimeSpan Freshness = TimeSpan.FromDays(7);

    private readonly ILogger<AvatarService> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly GraphServiceClient _graph;
    private readonly UserAvatarService _avatars;

    public AvatarService(
        ILogger<AvatarService> logger,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        GraphServiceClient graph,
        UserAvatarService avatars)
    {
        _logger = logger;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _graph = graph;
        _avatars = avatars;
    }

    public async Task<UserAvatarObject> GetAsync(ClaimsPrincipal user, bool forceRefresh = false)
    {
        string personId = user.GetPersonId();
        UserAvatarObject? cached = await _avatars.GetByPersonIdAsync(personId);
        if (!forceRefresh && cached != null && DateTime.Now - cached.UpdatedOn < Freshness)
            return cached;

        UserAvatarObject resolved = await ResolveAsync(user, personId);
        return await _avatars.SaveAsync(resolved);
    }

    private async Task<UserAvatarObject> ResolveAsync(ClaimsPrincipal user, string personId)
    {
        (byte[] Content, string ContentType, AvatarSource Source)? photo =
            await TryGraphAsync()
            ?? await TryGravatarAsync(user.FindEmail())
            ?? Initials(user, personId);

        return new UserAvatarObject
        {
            PersonId = personId,
            Source = photo.Value.Source,
            ContentType = photo.Value.ContentType,
            Content = photo.Value.Content,
            UpdatedOn = DateTime.Now
        };
    }

    private async Task<(byte[] Content, string ContentType, AvatarSource Source)?> TryGraphAsync()
    {
        if (string.IsNullOrWhiteSpace(_configuration["EntraId:ClientSecret"]))
            return null;

        try
        {
            await using Stream? stream = await _graph.Me.Photo.Content.GetAsync();
            if (stream is null)
                return null;

            using var buffer = new MemoryStream();
            await stream.CopyToAsync(buffer);
            if (buffer.Length == 0)
                return null;

            return (buffer.ToArray(), "image/jpeg", AvatarSource.Graph);
        }
        catch (Exception ex)
        {
            _logger.LogInformation(ex, "Graph profile photo is not available; falling back");
            return null;
        }
    }

    private async Task<(byte[] Content, string ContentType, AvatarSource Source)?> TryGravatarAsync(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return null;

        string hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(email.Trim().ToLowerInvariant())))
            .ToLowerInvariant();
        string url = $"https://www.gravatar.com/avatar/{hash}?d=404&s=120";

        try
        {
            HttpClient client = _httpClientFactory.CreateClient(nameof(AvatarService));
            using HttpResponseMessage response = await client.GetAsync(url);
            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;
            response.EnsureSuccessStatusCode();

            byte[] bytes = await response.Content.ReadAsByteArrayAsync();
            if (bytes.Length == 0)
                return null;

            string contentType = response.Content.Headers.ContentType?.MediaType ?? "image/jpeg";
            return (bytes, contentType, AvatarSource.Gravatar);
        }
        catch (Exception ex)
        {
            _logger.LogInformation(ex, "Gravatar is not available; falling back");
            return null;
        }
    }

    private static (byte[] Content, string ContentType, AvatarSource Source) Initials(ClaimsPrincipal user, string personId)
    {
        string initials = InitialsFrom(user.FindDisplayName(), user.FindEmail(), personId);
        string fill = ColorFrom(personId);
        string svg = $"""
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
              <rect width="128" height="128" fill="{fill}"/>
              <text x="64" y="64" text-anchor="middle" dominant-baseline="central"
                    font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="52" font-weight="600" fill="#ffffff">{initials}</text>
            </svg>
            """;

        return (Encoding.UTF8.GetBytes(svg), "image/svg+xml", AvatarSource.Initials);
    }

    private static string InitialsFrom(string? displayName, string? email, string personId)
    {
        string source = displayName ?? "";
        if (string.IsNullOrWhiteSpace(source) && !string.IsNullOrWhiteSpace(email))
            source = email.Split('@')[0].Replace('.', ' ').Replace('_', ' ').Replace('-', ' ');
        if (string.IsNullOrWhiteSpace(source))
            source = personId;

        string[] parts = source.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        char FirstLetter(string value) =>
            value.FirstOrDefault(char.IsLetterOrDigit) is char c ? char.ToUpperInvariant(c) : '?';

        if (parts.Length >= 2)
            return $"{FirstLetter(parts[0])}{FirstLetter(parts[^1])}";

        IEnumerable<char> letters = parts[0].Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant);
        string two = new string(letters.Take(2).ToArray());
        return two.Length > 0 ? two : "?";
    }

    private static string ColorFrom(string personId)
    {
        int hash = 0;
        foreach (char c in personId)
            hash = (hash * 31) + c;
        int hue = Math.Abs(hash) % 360;
        return $"hsl({hue}, 55%, 42%)";
    }
}

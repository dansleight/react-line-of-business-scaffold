namespace Scaffold.Business;

public class ValidationException : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(string message, IReadOnlyDictionary<string, string[]> errors)
        : base(message)
    {
        Errors = errors;
    }

    public static ValidationException ForField(string field, string error, string? message = null) =>
        new(
            message ?? error,
            new Dictionary<string, string[]>(StringComparer.OrdinalIgnoreCase)
            {
                [field] = [error]
            });
}

namespace EgyptianLawyers.Api.Errors;

public sealed record NotFoundError(string EntityName, object Key)
{
    public string Message => $"{EntityName} with key '{Key}' was not found.";
}

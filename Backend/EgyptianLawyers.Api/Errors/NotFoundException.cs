namespace EgyptianLawyers.Api.Errors;

public class NotFoundException : Exception
{
    public NotFoundError Error { get; }

    public NotFoundException(NotFoundError error) : base(error.Message)
    {
        Error = error;
    }
}

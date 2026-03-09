using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EgyptianLawyers.Api.Errors;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        if (exception is NotFoundException notFound)
        {
            httpContext.Response.StatusCode = StatusCodes.Status404NotFound;
            await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Not Found",
                Status = StatusCodes.Status404NotFound,
                Detail = notFound.Error.Message
            }, cancellationToken);
            return true;
        }

        if (exception is FluentValidation.ValidationException validationEx)
        {
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            var errors = validationEx.Errors.Select(e => new { e.PropertyName, e.ErrorMessage });
            await httpContext.Response.WriteAsJsonAsync(new { errors }, cancellationToken);
            return true;
        }

        if (exception is UnauthorizedAccessException)
        {
            httpContext.Response.StatusCode = StatusCodes.Status403Forbidden;
            await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Forbidden",
                Status = StatusCodes.Status403Forbidden,
                Detail = exception.Message
            }, cancellationToken);
            return true;
        }

        return false;
    }
}

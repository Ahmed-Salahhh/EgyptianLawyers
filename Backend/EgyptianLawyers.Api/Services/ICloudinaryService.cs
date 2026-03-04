namespace EgyptianLawyers.Api.Services;

public interface ICloudinaryService
{
    Task<string> UploadAsync(
        IFormFile file,
        string folderName = "lawyers/attachments",
        CancellationToken cancellationToken = default
    );
}

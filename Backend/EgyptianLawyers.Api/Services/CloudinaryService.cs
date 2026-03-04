using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using EgyptianLawyers.Api.Configurations;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace EgyptianLawyers.Api.Services;

public sealed class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IOptions<CloudinaryOptions> options)
    {
        var settings = options.Value;
        var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadAsync(
        IFormFile file,
        string folderName = "lawyers/attachments",
        CancellationToken cancellationToken = default
    )
    {
        if (file.Length == 0)
            return string.Empty;

        using var stream = file.OpenReadStream();

        var isImage = file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);

        if (isImage)
        {
            var imageParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folderName,
                Transformation = new Transformation()
                    .Width(1200)
                    .Height(1200)
                    .Crop("limit")
                    .Quality("auto"),
            };

            var uploadResult = await _cloudinary.UploadAsync(imageParams, cancellationToken);

            if (uploadResult.Error != null)
                throw new Exception(
                    $"Cloudinary image upload failed: {uploadResult.Error.Message}"
                );

            return uploadResult.SecureUrl.ToString();
        }
        else
        {
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folderName,
            };

            var uploadResult = await Task.Run(
                () => _cloudinary.Upload(rawParams),
                cancellationToken
            );

            if (uploadResult.Error != null)
                throw new Exception(
                    $"Cloudinary document upload failed: {uploadResult.Error.Message}"
                );

            return uploadResult.SecureUrl.ToString();
        }
    }
}

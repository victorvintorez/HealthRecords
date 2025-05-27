using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.Extensions.Caching.Distributed;

namespace HealthRecords.Server.Services;

public class SasTokenService(IDistributedCache cache, BlobServiceClient blobServiceClient) {
  public async Task<string> GetSasUriAsync(string userId, string containerName, string blobName) {
    var cacheKey = $"{userId}:{containerName}:{blobName}";
    var cachedUri = await cache.GetStringAsync(cacheKey);
        
    if (!string.IsNullOrEmpty(cachedUri)) {
      return cachedUri; // Return cached SAS token if available
    }

    var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
    var blobClient = containerClient.GetBlobClient(blobName);

    var sasBuilder = new BlobSasBuilder {
      BlobContainerName = containerName,
      BlobName = blobName,
      Resource = "b", // 'b' for blob
      ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
    };
    
    sasBuilder.SetPermissions(BlobSasPermissions.Read);

    var sasToken = blobClient.GenerateSasUri(sasBuilder).ToString();
        
    await cache.SetStringAsync(cacheKey, sasToken, new DistributedCacheEntryOptions {
      AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(59) // Cache for slightly less than the SAS token expiration
    });

    return sasToken;
  }
}
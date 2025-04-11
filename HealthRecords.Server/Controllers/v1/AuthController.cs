using System.ComponentModel.DataAnnotations;
using Azure.Storage.Blobs;
using HealthRecords.Server.Models.Authentication;
using HealthRecords.Server.Models.FromBody.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Azure;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]/[action]")]
[Produces("application/json")]
public class AuthController(ILogger<AuthController> logger, UserManager<HealthRecordsUser> userManager) : ControllerBase {
    private readonly ILogger<AuthController> _logger = logger;
    private readonly UserManager<HealthRecordsUser> _userManager = userManager;

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<Results<Ok, ValidationProblem>> Register([FromBody] RegisterRequest registration, [FromServices] IServiceProvider sp) {
        // Validate Email
        var emailAddressAttribute = new EmailAddressAttribute();
        if (string.IsNullOrEmpty(registration.Email) || emailAddressAttribute.IsValid(registration.Email)) {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>() {
                { nameof(registration.Email), ["Invalid email address."] }
            });
        }
        
        // Validate Password
        if (registration.Password != registration.ConfirmPassword) {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                { nameof(registration.Password), ["Passwords do not match."] }
            });
        }
        
        // Get Service Providers
        var userStore = sp.GetService<IUserStore<HealthRecordsUser>>();
        var emailStore = sp.GetService<IUserEmailStore<HealthRecordsUser>>();
        var blobStore = sp.GetService<IAzureClientFactory<BlobServiceClient>>();

        var user = new HealthRecordsUser();
        await userStore?.SetUserNameAsync(user, registration.Email, CancellationToken.None);
        await emailStore?.SetEmailAsync(user, registration.Email, CancellationToken.None);
        IdentityResult result = await _userManager.CreateAsync(user, registration.Password);
        
        if (!result.Succeeded) {
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>() {
                { nameof(registration.Password), result.Errors.Select(e => e.Description).ToArray() }
            });
        }
        
        // Upload Profile Image
        if (registration.ProfileImageFile != null) {
            BlobContainerClient? blobClient = blobStore?.CreateClient("healthrecords").GetBlobContainerClient("profile-images");
            if (blobClient == null) {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]> {
                    { nameof(registration.ProfileImageFile), ["Blob client is not available."] }
                });
            }
            await blobClient.CreateIfNotExistsAsync();
            var blobResponse = await blobClient.GetBlobClient($"${user.Id}-profile.png").UploadAsync(registration.ProfileImageFile.OpenReadStream(), true);
            
            if (!blobResponse.HasValue) {
                return TypedResults.ValidationProblem()
            }
        }
        

        return TypedResults.Ok();
    }
}
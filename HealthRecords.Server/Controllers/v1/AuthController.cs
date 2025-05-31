using System.ComponentModel.DataAnnotations;
using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using HealthRecords.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]/[action]")]
[Produces("application/json")]
public class AuthController(
    ILogger<AuthController> logger,
    HealthRecordsDbContext db,
    UserManager<IdentityUser> userManager,
    IUserStore<IdentityUser> userStore,
    BlobServiceClient blobServiceClient,
    SignInManager<IdentityUser> signInManager) : ControllerBase
{
    [HttpPost(Name = "register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, InternalServerError<string>>> Register(
        [FromForm] CreateStaffFb body)
    {
        // Check a user isn't already logged in
        if (!string.IsNullOrEmpty(userManager.GetUserId(User)))
        {
            return TypedResults.BadRequest("User is already logged in.");
        }

        // Check an account with email doesn't already exist
        if (await userManager.FindByEmailAsync(body.Email) != null)
        {
            return TypedResults.BadRequest("Email is already in use.");
        }

        // Create a user account
        var emailAddressAttribute = new EmailAddressAttribute();
        if (string.IsNullOrEmpty(body.Email) || !emailAddressAttribute.IsValid(body.Email))
        {
            return TypedResults.BadRequest("Email is invalid.");
        }

        var emailStore = (IUserEmailStore<IdentityUser>)userStore;
        var user = new IdentityUser();
        await userStore.SetUserNameAsync(user, body.Email, CancellationToken.None);
        await emailStore.SetEmailAsync(user, body.Email, CancellationToken.None);
        var creationResult = await userManager.CreateAsync(user, body.Password);

        if (!creationResult.Succeeded)
        {
            return TypedResults.BadRequest(creationResult.Errors.First().Description);
        }

        // Log in freshly created user
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;

        var loginResult = await signInManager.PasswordSignInAsync(body.Email, body.Password, true, true);

        if (!loginResult.Succeeded)
        {
            logger.LogError("Couldn't log in user.");
            return TypedResults.InternalServerError("Couldn't log in user.");
        }

        // Retrieve the user's ID
        var userId = userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId))
        {
            logger.LogError("Couldn't retrieve user ID.");
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Check if hospital exists
        var hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == body.HospitalId);
        if (hospital == null)
        {
            return TypedResults.BadRequest("Hospital ID is invalid.");
        }

        // Check content type of profile image
        if (!FileType.IsType(body.ProfileImage.ContentType, FileType.Type.Image))
        {
            return TypedResults.BadRequest("Profile image must be an image.");
        }

        // Upload the profile image to blob storage
        var filename = $"{userId}_profile-img.{body.ProfileImage.FileName.Split(".").Last()}";
        var blobClient = blobServiceClient
            .GetBlobContainerClient("staff-profile-images").GetBlobClient(filename);

        try
        {
            await blobClient.UploadAsync(body.ProfileImage.OpenReadStream());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Couldn't upload profile image to blob storage");
            return TypedResults.InternalServerError("Couldn't upload profile image to blob storage.");
        }

        // Create the new staff member
        db.Staff.Add(new Staff
        {
            AccountId = userId,
            FullName = body.FullName,
            Department = body.Department,
            Role = StaffRole.Viewer,
            HospitalId = hospital.Id,
            Hospital = hospital,
            ProfileImage = new FileBlob
            {
                FileName = filename,
                ContentType = body.ProfileImage.ContentType,
                Container = blobClient.BlobContainerName
            }
        });
        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Couldn't create new staff member record");
            return TypedResults.InternalServerError("Couldn't create new staff member record.");
        }

        return TypedResults.Ok();
    }

    [HttpPost(Name = "login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<Results<Ok, BadRequest<string>>>
        Login([FromBody] LoginFb body)
    {
        // Check a user isn't already logged in
        if (!string.IsNullOrEmpty(userManager.GetUserId(User)))
        {
            return TypedResults.BadRequest("User is already logged in.");
        }

        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;

        var result = await signInManager.PasswordSignInAsync(body.Email, body.Password, true, true);

        if (!result.Succeeded)
        {
            return TypedResults.BadRequest("Invalid email or password.");
        }

        return TypedResults.Ok();
    }

    [HttpPost(Name = "logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<Results<Ok, BadRequest<string>, UnauthorizedHttpResult>>
        Logout([FromBody] object? obj = null)
    {
        // Check a user is logged in
        if (string.IsNullOrEmpty(userManager.GetUserId(User)))
        {
            return TypedResults.BadRequest("User is not logged in.");
        }

        if (obj == null) return TypedResults.Unauthorized();
        await signInManager.SignOutAsync();
        return TypedResults.Ok();
    }

    [HttpGet(Name = "isAdmin")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<Results<Ok<bool>, UnauthorizedHttpResult>> IsAdmin()
    {
        // Check a user is logged in
        var user = await userManager.GetUserAsync(User);
        if (user == null)
        {
            return TypedResults.Unauthorized();
        }

        // Check if the user has the administrator role
        var isAdmin = await userManager.IsInRoleAsync(user, "Administrator");
        return TypedResults.Ok(isAdmin);
    }
}
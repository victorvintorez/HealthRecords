using System.ComponentModel.DataAnnotations;
using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using HealthRecords.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class StaffController(
    ILogger<StaffController> logger,
    HealthRecordsDbContext db,
    UserManager<IdentityUser> userManager,
    IUserStore<IdentityUser> userStore,
    BlobServiceClient blobServiceClient,
    SignInManager<IdentityUser> signInManager,
    EmailAddressAttribute emailAddressAttribute) : ControllerBase {
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<StaffDto>, InternalServerError<string>, NotFound<string>>> GetStaffSelf() {
        // Get the currently authorized user's ID
        var userId = userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId)) {
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Retrieve and map the staff record to StaffDto
        StaffDto? staff = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .Where(s => s.AccountId == userId)
            .Select(s => new StaffDto {
                Id = s.Id,
                FullName = s.FullName,
                Department = s.Department,
                Role = s.Role.ToString(),
                HospitalId = s.HospitalId,
                HospitalName = s.Hospital.Name,
                ProfileImageUrl = s.ProfileImage.Url
            })
            .FirstOrDefaultAsync();

        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        return TypedResults.Ok(staff);
    }

    [HttpGet("all")]
    [Authorize(Policy = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<StaffPageDto>, NotFound<string>>> GetStaffAll([FromQuery] int page = 0) {
        const int top = 20;
        var skip = page >= 1 ? page - 1 : 0;

        var staff = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .OrderBy(w => w.FullName)
            .ThenBy(w => w.Id)
            .Skip(skip)
            .Take(top)
            .Select(s => new StaffDto {
                Id = s.Id,
                FullName = s.FullName,
                Department = s.Department,
                Role = s.Role.ToString(),
                HospitalId = s.HospitalId,
                HospitalName = s.Hospital.Name,
                ProfileImageUrl = s.ProfileImage.Url
            }).ToListAsync();

        if (staff.Count == 0) {
            return TypedResults.NotFound("Couldn't find any records.");
        }
        
        return TypedResults.Ok(new StaffPageDto {
            Staff = staff,
            Cursor = staff.Count == top ? page + 1 : null
        });
    }

    [HttpGet("{id:int}", Name = "GetStaffById")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<StaffDto>, NotFound<string>>> GetStaffById([FromRoute] int id) {
        // Retrieve and map the staff record to StaffDto
        StaffDto? staff = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .Where(s => s.Id == id)
            .Select(s => new StaffDto {
                Id = s.Id,
                FullName = s.FullName,
                Department = s.Department,
                Role = s.Role.ToString(),
                HospitalId = s.HospitalId,
                HospitalName = s.Hospital.Name,
                ProfileImageUrl = s.ProfileImage.Url
            })
            .FirstOrDefaultAsync();

        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        return TypedResults.Ok(staff);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, InternalServerError<string>>> CreateStaff(
        [FromBody] CreateStaffFb body) {
        // Check a user isn't already logged in
        if (!string.IsNullOrEmpty(userManager.GetUserId(User))) {
            return TypedResults.BadRequest("User is already logged in.");
        }
        
        // Check an account with email doesn't already exist
        if (await userManager.FindByEmailAsync(body.Email) != null) {
            return TypedResults.BadRequest("Email is already in use.");
        }

        // Create a user account
        if (string.IsNullOrEmpty(body.Email) || !emailAddressAttribute.IsValid(body.Email)) {
            return TypedResults.BadRequest("Email is invalid.");
        }

        var emailStore = (IUserEmailStore<IdentityUser>)userStore;
        var user = new IdentityUser();
        await userStore.SetUserNameAsync(user, body.Email, CancellationToken.None);
        await emailStore.SetEmailAsync(user, body.Email, CancellationToken.None);
        IdentityResult creationResult = await userManager.CreateAsync(user, body.Password);

        if (!creationResult.Succeeded) {
            return TypedResults.BadRequest(creationResult.Errors.First().Description);
        }
        
        // Log in freshly created user
        signInManager.AuthenticationScheme = IdentityConstants.ApplicationScheme;
        
        SignInResult loginResult = await signInManager.PasswordSignInAsync(body.Email, body.Password, true, true);

        if (!loginResult.Succeeded) {
            return TypedResults.InternalServerError("Couldn't log in user.");
        }
        
        // Retrieve the user's ID
        var userId = userManager.GetUserId(User);
        if (string.IsNullOrEmpty(userId)) {
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Check if hospital exists
        Hospital? hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == body.HospitalId);
        if (hospital == null) {
            return TypedResults.BadRequest("Hospital ID is invalid.");
        }

        // Check content type of profile image
        if (!FileType.IsType(body.ProfileImage.ContentType, FileType.Type.Image)) {
            return TypedResults.BadRequest("Profile image must be an image.");
        }

        // Upload the profile image to blob storage
        var filename = $"{userId}_profile-img.{body.ProfileImage.FileName.Split(".").Last()}";
        BlobClient blobClient = blobServiceClient
            .GetBlobContainerClient("staff-profile-images").GetBlobClient(filename);

        try {
            await blobClient.UploadAsync(body.ProfileImage.OpenReadStream());
        }
        catch (Exception) {
            return TypedResults.InternalServerError("Couldn't upload profile image to blob storage.");
        }

        // Create the new staff member
        db.Staff.Add(new Staff {
            AccountId = userId,
            FullName = body.FullName,
            Department = body.Department,
            Role = StaffRole.Viewer,
            HospitalId = hospital.Id,
            Hospital = hospital,
            ProfileImage = new FileBlob {
                FileName = filename,
                ContentType = body.ProfileImage.ContentType,
                Url = blobClient.Uri.ToString()
            }
        });
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception) {
            return TypedResults.InternalServerError("Couldn't create new staff member record.");
        }

        return TypedResults.Ok();
    }

    [HttpDelete]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<RedirectHttpResult, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        DeleteStaff() {
        // Get the currently authorized user's ID
        IdentityUser? user = await userManager.GetUserAsync(User);
        if (user == null) {
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Retrieve staff record
        Staff? staff = await db.Staff.Include(staff => staff.ProfileImage)
            .FirstOrDefaultAsync(s => s.AccountId == user.Id);

        // Check if the staff record exists
        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        // Delete profile image from blob storage
        BlobClient blobClient = blobServiceClient
            .GetBlobContainerClient("staff-profile-images")
            .GetBlobClient(staff.ProfileImage.FileName);
        await blobClient.DeleteIfExistsAsync();

        // Delete the staff record
        db.Staff.Remove(staff);
        await db.SaveChangesAsync();

        // Remove the user's identity account
        await signInManager.SignOutAsync();
        await userManager.DeleteAsync(user);

        return TypedResults.Redirect("/");
    }

    [HttpDelete("{id:int}", Name = "DeleteStaffById")]
    [Authorize(Policy = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<RedirectHttpResult, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        DeleteStaffById([FromRoute] int id) {
        // Retrieve staff record
        Staff? staff = await db.Staff.Include(staff => staff.ProfileImage)
            .FirstOrDefaultAsync(s => s.Id == id);

        // Check if the staff record exists
        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        // Check if the staff record has an Identity user account
        IdentityUser? user = await userManager.FindByIdAsync(staff.AccountId);
        if (user == null) {
            return TypedResults.BadRequest("Staff record doesn't have an associated Identity user account.");
        }

        // Delete profile image from blob storage
        BlobClient blobClient = blobServiceClient
            .GetBlobContainerClient("staff-profile-images")
            .GetBlobClient(staff.ProfileImage.FileName);
        await blobClient.DeleteIfExistsAsync();

        // Delete the staff record
        db.Staff.Remove(staff);
        await db.SaveChangesAsync();

        // Delete the user's identity account
        await signInManager.SignOutAsync();
        await userManager.DeleteAsync(user);

        return TypedResults.Redirect("/");
    }

    [HttpPatch]
    [Authorize]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdateStaff(
        [FromBody] UpdateStaffFb body) {
        // Get the currently authorized user's ID
        IdentityUser? user = await userManager.GetUserAsync(User);
        if (user == null) {
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Retrieve staff record
        Staff? staff = await db.Staff.Include(staff => staff.ProfileImage)
            .FirstOrDefaultAsync(s => s.AccountId == user.Id);

        // Check if the staff record exists
        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        if (body.FullName != null && body.FullName != staff.FullName) {
            staff.FullName = body.FullName;
        }

        if (body.Department != null && body.Department != staff.Department) {
            staff.Department = body.Department;
        }

        if (body.Role != null) {
            try {
                var role = Enum.Parse<StaffRole>(body.Role);
                if (role != staff.Role) {
                    staff.Role = role;
                }
            }
            catch (Exception) {
                return TypedResults.BadRequest("Invalid role.");
            }
        }

        if (body.HospitalId != null && body.HospitalId != staff.HospitalId) {
            Hospital? hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == body.HospitalId);
            if (hospital != null) {
                staff.HospitalId = hospital.Id;
                staff.Hospital = hospital;
            }
            else {
                return TypedResults.BadRequest("Hospital ID is invalid.");
            }
        }

        if (body.ProfileImage != null) {
            // Check content type of profile image
            if (!FileType.IsType(body.ProfileImage.ContentType, FileType.Type.Image)) {
                return TypedResults.BadRequest("Profile image must be an image.");
            }

            // Upload the profile image to blob storage
            var filename = $"{user.Id}_profile-img.{body.ProfileImage.FileName.Split(".").Last()}";
            BlobClient blobClient = blobServiceClient
                .GetBlobContainerClient("staff-profile-images").GetBlobClient(filename);

            try {
                await blobClient.UploadAsync(body.ProfileImage.OpenReadStream());
                staff.ProfileImage = new FileBlob {
                    FileName = filename,
                    ContentType = body.ProfileImage.ContentType,
                    Url = blobClient.Uri.ToString()
                };
                // Delete old profile image from blob storage
                BlobClient oldBlobClient = blobServiceClient
                    .GetBlobContainerClient("staff-profile-images")
                    .GetBlobClient(staff.ProfileImage.FileName);
                await oldBlobClient.DeleteIfExistsAsync();
                // Delete old profile image from database
                db.FileBlobs.Remove(staff.ProfileImage);
            }
            catch (Exception) {
                return TypedResults.InternalServerError("Couldn't update profile image in blob storage.");
            }
        }

        // Save the updated staff record
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }

    [HttpPatch("{id:int}", Name = "UpdateStaffById")]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdateStaffById(
        [FromRoute] int id, [FromBody] UpdateStaffFb body) {
        // Retrieve staff record
        Staff? staff = await db.Staff.Include(staff => staff.ProfileImage)
            .FirstOrDefaultAsync(s => s.Id == id);

        // Check if the staff record exists
        if (staff == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        // Check if the staff record has an Identity user account
        IdentityUser? user = await userManager.FindByIdAsync(staff.AccountId);
        if (user == null) {
            return TypedResults.BadRequest("Staff record doesn't have an associated Identity user account.");
        }

        if (body.FullName != null && body.FullName != staff.FullName) {
            staff.FullName = body.FullName;
        }

        if (body.Department != null && body.Department != staff.Department) {
            staff.Department = body.Department;
        }

        if (body.Role != null) {
            if (body.Role == "Administrator") {
                await userManager.AddToRoleAsync(user, "Administrator");
            }
            else {
                try {
                    var role = Enum.Parse<StaffRole>(body.Role);
                    if (role != staff.Role) {
                        staff.Role = role;
                    }
                }
                catch (Exception) {
                    return TypedResults.BadRequest("Invalid role.");
                }
            }
        }

        if (body.HospitalId != null && body.HospitalId != staff.HospitalId) {
            Hospital? hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == body.HospitalId);
            if (hospital != null) {
                staff.HospitalId = hospital.Id;
                staff.Hospital = hospital;
            }
            else {
                return TypedResults.BadRequest("Hospital ID is invalid.");
            }
        }

        if (body.ProfileImage != null) {
            // Check content type of profile image
            if (!FileType.IsType(body.ProfileImage.ContentType, FileType.Type.Image)) {
                return TypedResults.BadRequest("Profile image must be an image.");
            }

            // Upload the profile image to blob storage
            var filename = $"{user.Id}_profile-img.{body.ProfileImage.FileName.Split(".").Last()}";
            BlobClient blobClient = blobServiceClient
                .GetBlobContainerClient("staff-profile-images").GetBlobClient(filename);

            try {
                await blobClient.UploadAsync(body.ProfileImage.OpenReadStream());
                staff.ProfileImage = new FileBlob {
                    FileName = filename,
                    ContentType = body.ProfileImage.ContentType,
                    Url = blobClient.Uri.ToString()
                };
                // Delete old profile image from blob storage
                BlobClient oldBlobClient = blobServiceClient
                    .GetBlobContainerClient("staff-profile-images")
                    .GetBlobClient(staff.ProfileImage.FileName);
                await oldBlobClient.DeleteIfExistsAsync();
                // Delete old profile image from database
                db.FileBlobs.Remove(staff.ProfileImage);
            }
            catch (Exception) {
                return TypedResults.InternalServerError("Couldn't update profile image in blob storage.");
            }
        }

        // Save the updated staff record
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }
}
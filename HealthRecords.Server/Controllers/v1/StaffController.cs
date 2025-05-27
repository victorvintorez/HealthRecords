using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using HealthRecords.Server.Services;
using HealthRecords.Server.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class StaffController(
    ILogger<StaffController> logger,
    HealthRecordsDbContext db,
    UserManager<IdentityUser> userManager,
    BlobServiceClient blobServiceClient,
    SasTokenService sasTokenService,
    SignInManager<IdentityUser> signInManager) : ControllerBase {
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
            logger.LogError("Couldn't retrieve user ID.");
            return TypedResults.InternalServerError("Couldn't retrieve user ID.");
        }

        // Retrieve and map the staff record to StaffDto
        var staffRecord = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .Where(s => s.AccountId == userId)
            .FirstOrDefaultAsync();

        if (staffRecord == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        string profileImageUrl = string.Empty;
        if (!string.IsNullOrEmpty(staffRecord.ProfileImage.FileName)) {
            profileImageUrl = await sasTokenService.GetSasUriAsync(
                staffRecord.AccountId,
                staffRecord.ProfileImage.Container,
                staffRecord.ProfileImage.FileName
            );
        }

        var staff = new StaffDto {
            Id = staffRecord.Id,
            FullName = staffRecord.FullName,
            Department = staffRecord.Department,
            Role = staffRecord.Role.ToString(),
            HospitalId = staffRecord.HospitalId,
            HospitalName = staffRecord.Hospital.Name,
            ProfileImageUrl = profileImageUrl
        };

        return TypedResults.Ok(staff);
    }

    [HttpGet("all")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<StaffPageDto>, NotFound<string>>> GetStaffAll([FromQuery] int page = 0) {
        const int top = 20;
        var skip = page >= 1 ? page - 1 : 0;

        var staffRecords = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .OrderBy(w => w.FullName)
            .ThenBy(w => w.Id)
            .Skip(skip)
            .Take(top)
            .ToListAsync();

        if (staffRecords.Count == 0) {
            return TypedResults.NotFound("Couldn't find any records.");
        }

        var staffList = new List<StaffDto>();
        foreach (var s in staffRecords) {
            string profileImageUrl = string.Empty;
            if (!string.IsNullOrEmpty(s.ProfileImage.FileName)) {
                profileImageUrl = await sasTokenService.GetSasUriAsync(
                    s.AccountId,
                    s.ProfileImage.Container,
                    s.ProfileImage.FileName
                );
            }
            staffList.Add(new StaffDto {
                Id = s.Id,
                FullName = s.FullName,
                Department = s.Department,
                Role = s.Role.ToString(),
                HospitalId = s.HospitalId,
                HospitalName = s.Hospital.Name,
                ProfileImageUrl = profileImageUrl
            });
        }
        return TypedResults.Ok(new StaffPageDto {
            Staff = staffList,
            Cursor = staffList.Count == top ? page + 1 : null
        });
    }

    [HttpGet("{id:int}", Name = "GetStaffById")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<StaffDto>, NotFound<string>>> GetStaffById([FromRoute] int id) {
        // Retrieve and map the staff record to StaffDto
        var staffRecord = await db.Staff
            .Include(s => s.Hospital)
            .Include(s => s.ProfileImage)
            .Where(s => s.Id == id)
            .FirstOrDefaultAsync();

        if (staffRecord == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        string profileImageUrl = string.Empty;
        if (!string.IsNullOrEmpty(staffRecord.ProfileImage.FileName)) {
            profileImageUrl = await sasTokenService.GetSasUriAsync(
                staffRecord.AccountId,
                staffRecord.ProfileImage.Container,
                staffRecord.ProfileImage.FileName
            );
        }

        var staff = new StaffDto {
            Id = staffRecord.Id,
            FullName = staffRecord.FullName,
            Department = staffRecord.Department,
            Role = staffRecord.Role.ToString(),
            HospitalId = staffRecord.HospitalId,
            HospitalName = staffRecord.Hospital.Name,
            ProfileImageUrl = profileImageUrl
        };

        return TypedResults.Ok(staff);
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
            logger.LogError("Couldn't retrieve user ID.");
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
    [Authorize(Roles = "Administrator")]
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdateStaff(
        [FromForm] UpdateStaffFb body) {
        // Get the currently authorized user's ID
        IdentityUser? user = await userManager.GetUserAsync(User);
        if (user == null) {
            logger.LogError("Couldn't retrieve user ID.");
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
                    Container = blobClient.BlobContainerName
                };
                // Delete old profile image from blob storage
                BlobClient oldBlobClient = blobServiceClient
                    .GetBlobContainerClient("staff-profile-images")
                    .GetBlobClient(staff.ProfileImage.FileName);
                await oldBlobClient.DeleteIfExistsAsync();
                // Delete old profile image from database
                db.FileBlobs.Remove(staff.ProfileImage);
            }
            catch (Exception ex) {
                logger.LogError(ex, "Couldn't update profile image in blob storage");
                return TypedResults.InternalServerError("Couldn't update profile image in blob storage.");
            }
        }

        // Save the updated staff record
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }

    [HttpPatch("{id:int}", Name = "UpdateStaffById")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdateStaffById(
        [FromRoute] int id, [FromForm] UpdateStaffFb body) {
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
                    Container = blobClient.BlobContainerName
                };
                // Delete old profile image from blob storage
                BlobClient oldBlobClient = blobServiceClient
                    .GetBlobContainerClient("staff-profile-images")
                    .GetBlobClient(staff.ProfileImage.FileName);
                await oldBlobClient.DeleteIfExistsAsync();
                // Delete old profile image from database
                db.FileBlobs.Remove(staff.ProfileImage);
            }
            catch (Exception ex) {
                logger.LogError(ex, "Couldn't update profile image in blob storage");
                return TypedResults.InternalServerError("Couldn't update profile image in blob storage.");
            }
        }

        // Save the updated staff record
        await db.SaveChangesAsync();

        return TypedResults.Ok();
    }
}
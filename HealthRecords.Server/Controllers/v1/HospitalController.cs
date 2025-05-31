using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.FromBody;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class HospitalController(
    ILogger<HospitalController> logger,
    HealthRecordsDbContext db
) : ControllerBase {
    // Get all hospitals
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<Results<Ok<List<HospitalDto>>, NotFound<string>>> GetHospitalAll() {
        return TypedResults.Ok(await db.Hospitals
            .OrderBy(h => h.Name)
            .Select(h => new HospitalDto {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                PhoneNumber = h.PhoneNumber,
            }).ToListAsync());
    }

    // Get a hospital by ID
    [HttpGet("{id:int}", Name = "GetHospitalById")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<HospitalDto>, NotFound<string>>> GetHospitalById([FromRoute] int id) {
        var hospital = await db.Hospitals
            .Where(h => h.Id == id)
            .Select(h => new HospitalDto {
                Id = h.Id,
                Name = h.Name,
                Address = h.Address,
                PhoneNumber = h.PhoneNumber,
            }).FirstOrDefaultAsync();

        if (hospital == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        return TypedResults.Ok(hospital);
    }

    // Create a hospital
    [HttpPost]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, InternalServerError<string>>> CreateHospital(
        [FromBody] CreateHospitalFb body) {
        // Check if hospital exists
        if (await db.Hospitals.AnyAsync(h => h.Name == body.Name)) {
            return TypedResults.BadRequest("Hospital already exists.");
        }

        // Create the new hospital
        db.Hospitals.Add(new Hospital {
            Name = body.Name,
            Address = body.Address,
            PhoneNumber = body.PhoneNumber,
        });

        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't create new hospital record");
            return TypedResults.InternalServerError("Couldn't create new hospital record.");
        }

        return TypedResults.Ok();
    }

    // Delete a Hospital by ID
    [HttpDelete("{id:int}", Name = "DeleteHospitalById")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<RedirectHttpResult, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        DeleteHospitalById([FromRoute] int id) {
        // Check if hospital exists
        var hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == id);
        if (hospital == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        // Delete the hospital
        db.Hospitals.Remove(hospital);
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't delete hospital record");
            return TypedResults.InternalServerError("Couldn't delete hospital record.");
        }

        return TypedResults.Redirect("/");
    }
    
    // Update a Hospital by ID
    [HttpPatch("{id:int}", Name = "UpdateHospitalById")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdateHospitalById(
        [FromRoute] int id,
        [FromBody] UpdateHospitalFb body
        ) {
        // Check hospital exists
        var hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == id);
        if (hospital == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }
        
        // Update details
        if (body.Name != null && body.Name != hospital.Name) {
            hospital.Name = body.Name;
        }
        
        if (body.Address != null && body.Address != hospital.Address) {
            hospital.Address = body.Address;
        }
        
        if (body.PhoneNumber != null && body.PhoneNumber != hospital.PhoneNumber) {
            hospital.PhoneNumber = body.PhoneNumber;
        }
        
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't update hospital record");
            return TypedResults.InternalServerError("Couldn't update hospital record.");
        }
        
        return TypedResults.Ok();
    }
}
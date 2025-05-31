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
public class GeneralPractitionerController(
    ILogger<GeneralPractitionerController> logger,
    HealthRecordsDbContext db
) : ControllerBase
{
    // Get all general practitioners (unpaged)
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<Results<Ok<List<GeneralPractitionerDto>>, NotFound<string>>> GetGeneralPractitionerAll()
    {
        return TypedResults.Ok(await db.GeneralPractitioners
            .Select(gp => new GeneralPractitionerDto
            {
                Id = gp.Id,
                SurgeryName = gp.SurgeryName,
                Address = gp.Address,
                PhoneNumber = gp.PhoneNumber,
                Email = gp.Email,
                Website = gp.Website
            })
            .ToListAsync());
    }

    // Get a general practitioner by ID
    [HttpGet("{id:int}", Name = "GetGeneralPractitionerById")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<GeneralPractitionerDto>, NotFound<string>>> GetGeneralPractitionerById(
        [FromRoute] int id)
    {
        var gp = await db.GeneralPractitioners.FindAsync(id);
        if (gp == null)
        {
            return TypedResults.NotFound($"General practitioner with id {id} not found.");
        }

        var dto = new GeneralPractitionerDto
        {
            Id = gp.Id,
            SurgeryName = gp.SurgeryName,
            Address = gp.Address,
            PhoneNumber = gp.PhoneNumber,
            Email = gp.Email,
            Website = gp.Website
        };
        return TypedResults.Ok(dto);
    }

    // Create a general practitioner
    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, InternalServerError<string>>>
        CreateGeneralPractitioner([FromBody] CreateGeneralPractitionerFb body)
    {
        var gp = new GeneralPractitioner
        {
            SurgeryName = body.SurgeryName,
            Address = body.Address,
            PhoneNumber = body.PhoneNumber,
            Email = body.Email,
            Website = body.Website
        };
        try
        {
            db.GeneralPractitioners.Add(gp);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create general practitioner");
            return TypedResults.InternalServerError("Failed to create general practitioner.");
        }
    }

    // Update a general practitioner by ID
    [HttpPut("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async
        Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        UpdateGeneralPractitioner(
            [FromRoute] int id, [FromBody] UpdateGeneralPractitionerFb body)
    {
        var gp = await db.GeneralPractitioners.FindAsync(id);
        if (gp == null)
        {
            return TypedResults.NotFound($"General practitioner with id {id} not found.");
        }

        try
        {
            if (body.SurgeryName != null) gp.SurgeryName = body.SurgeryName;
            if (body.Address != null) gp.Address = body.Address;
            if (body.PhoneNumber != null) gp.PhoneNumber = body.PhoneNumber;
            if (body.Email != null) gp.Email = body.Email;
            if (body.Website != null) gp.Website = body.Website;
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update general practitioner");
            return TypedResults.InternalServerError("Failed to update general practitioner.");
        }
    }

    // Delete a general practitioner by ID
    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, InternalServerError<string>>> DeleteGeneralPractitionerById(
        [FromRoute] int id)
    {
        var gp = await db.GeneralPractitioners.FindAsync(id);
        if (gp == null)
        {
            return TypedResults.NotFound($"General practitioner with id {id} not found.");
        }

        try
        {
            db.GeneralPractitioners.Remove(gp);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete general practitioner");
            return TypedResults.InternalServerError("Failed to delete general practitioner.");
        }
    }
}

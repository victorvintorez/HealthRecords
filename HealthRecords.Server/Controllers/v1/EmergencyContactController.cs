using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/patient/{patientId:int}/[controller]")]
[Produces("application/json")]
public class EmergencyContactController(
    ILogger<EmergencyContactController> logger,
    HealthRecordsDbContext db
) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<List<EmergencyContactDto>>, NotFound<string>>> GetAll([FromRoute] int patientId)
    {
        var patient = await db.Patients.Include(p => p.EmergencyContacts).FirstOrDefaultAsync(p => p.Id == patientId);
        if (patient == null)
            return TypedResults.NotFound("Couldn't find a patient with the provided ID.");
        var contacts = patient.EmergencyContacts.Select(ec => new EmergencyContactDto
        {
            Id = ec.Id,
            FullName = ec.FullName,
            Relationship = ec.Relationship.ToString(),
            PhoneNumber = ec.PhoneNumber,
            PatientId = ec.PatientId
        }).ToList();
        return TypedResults.Ok(contacts);
    }

    [HttpGet("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<EmergencyContactDto>, NotFound<string>>> GetById([FromRoute] int patientId,
        [FromRoute] int id)
    {
        var contact = await db.EmergencyContacts.FirstOrDefaultAsync(ec => ec.Id == id && ec.PatientId == patientId);
        if (contact == null)
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        var dto = new EmergencyContactDto
        {
            Id = contact.Id,
            FullName = contact.FullName,
            Relationship = contact.Relationship.ToString(),
            PhoneNumber = contact.PhoneNumber,
            PatientId = contact.PatientId
        };
        return TypedResults.Ok(dto);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async
        Task<Results<Ok, BadRequest<string>, NotFound<string>, InternalServerError<string>>>
        Create(
            [FromRoute] int patientId, [FromBody] CreateEmergencyContactFb body)
    {
        var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
        if (patient == null)
            return TypedResults.NotFound("Couldn't find a patient with the provided ID.");
        if (!Enum.TryParse<Relationship>(body.Relationship, out var relationship))
            return TypedResults.BadRequest("Invalid relationship.");
        var contact = new EmergencyContact
        {
            FullName = body.FullName,
            Relationship = relationship,
            PhoneNumber = body.PhoneNumber,
            PatientId = patientId,
            Patient = patient
        };
        db.EmergencyContacts.Add(contact);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Couldn't create emergency contact record");
            return TypedResults.InternalServerError("Couldn't create emergency contact record.");
        }

        return TypedResults.Ok();
    }

    [HttpPatch("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async
        Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        Update(
            [FromRoute] int patientId, [FromRoute] int id, [FromBody] UpdateEmergencyContactFb body)
    {
        var contact = await db.EmergencyContacts.FirstOrDefaultAsync(ec => ec.Id == id && ec.PatientId == patientId);
        if (contact == null)
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        if (body.FullName != null && body.FullName != contact.FullName)
            contact.FullName = body.FullName;
        if (body.Relationship != null)
        {
            if (!Enum.TryParse<Relationship>(body.Relationship, out var relationship))
                return TypedResults.BadRequest("Invalid relationship.");
            contact.Relationship = relationship;
        }

        if (body.PhoneNumber != null && body.PhoneNumber != contact.PhoneNumber)
            contact.PhoneNumber = body.PhoneNumber;
        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Couldn't update emergency contact record");
            return TypedResults.InternalServerError("Couldn't update emergency contact record.");
        }

        return TypedResults.Ok();
    }

    [HttpDelete("{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, InternalServerError<string>>> Delete([FromRoute] int patientId,
        [FromRoute] int id)
    {
        var contact = await db.EmergencyContacts.FirstOrDefaultAsync(ec => ec.Id == id && ec.PatientId == patientId);
        if (contact == null)
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        db.EmergencyContacts.Remove(contact);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Couldn't delete emergency contact record");
            return TypedResults.InternalServerError("Couldn't delete emergency contact record.");
        }

        return TypedResults.Ok();
    }
}

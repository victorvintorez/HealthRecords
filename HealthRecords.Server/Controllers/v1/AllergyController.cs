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
public class AllergyController(
    ILogger<AllergyController> logger,
    HealthRecordsDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<List<AllergyDto>>, NotFound<string>, StatusCodeHttpResult>> GetAllergies(
        [FromRoute] int patientId)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Allergies).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var allergies = patient.Allergies.Select(a => new AllergyDto
            {
                Id = a.Id,
                Name = a.Name,
                CommonName = a.CommonName,
                Severity = a.Severity.ToString()
            }).ToList();
            return TypedResults.Ok(allergies);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while getting allergies for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("{allergyId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<AllergyDto>, NotFound<string>, StatusCodeHttpResult>> GetAllergy(
        [FromRoute] int patientId, [FromRoute] int allergyId)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Allergies).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var allergy = patient.Allergies.FirstOrDefault(a => a.Id == allergyId);
            if (allergy == null)
            {
                return TypedResults.NotFound("Allergy not found for this patient.");
            }

            var allergies = new AllergyDto
            {
                Id = allergy.Id,
                Name = allergy.Name,
                CommonName = allergy.CommonName,
                Severity = allergy.Severity.ToString()
            };
            return TypedResults.Ok(allergies);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while getting allergy {AllergyId} for patient {PatientId}",
                allergyId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, NotFound<string>, StatusCodeHttpResult>> AddAllergy(
        [FromRoute] int patientId, [FromBody] CreateAllergyFb allergyFb)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Allergies).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            if (patient.Allergies.Any(a => a.Name == allergyFb.Name && a.CommonName == allergyFb.CommonName))
            {
                return TypedResults.BadRequest("Allergy already exists for this patient.");
            }

            if (!Enum.TryParse<AllergenSeverity>(allergyFb.Severity, out var severity))
            {
                return TypedResults.BadRequest("Invalid severity value.");
            }

            var allergy = new Allergy
            {
                Name = allergyFb.Name,
                CommonName = allergyFb.CommonName,
                Severity = severity
            };
            patient.Allergies.Add(allergy);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while adding allergy for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpDelete("{allergyId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> DeleteAllergy([FromRoute] int patientId,
        [FromRoute] int allergyId)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Allergies).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var allergy = patient.Allergies.FirstOrDefault(a => a.Id == allergyId);
            if (allergy == null)
            {
                return TypedResults.NotFound("Allergy not found for this patient.");
            }

            patient.Allergies.Remove(allergy);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while deleting allergy {AllergyId} for patient {PatientId}",
                allergyId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPatch("{allergyId:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, NotFound<string>, StatusCodeHttpResult>>
        UpdateAllergy([FromRoute] int patientId, [FromRoute] int allergyId, [FromBody] UpdateAllergyFb updatedAllergy)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Allergies).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var allergy = patient.Allergies.FirstOrDefault(a => a.Id == allergyId);
            if (allergy == null)
            {
                return TypedResults.NotFound("Allergy not found for this patient.");
            }

            if (updatedAllergy.Name != null) allergy.Name = updatedAllergy.Name;
            if (updatedAllergy.CommonName != null) allergy.CommonName = updatedAllergy.CommonName;
            if (updatedAllergy.Severity != null)
            {
                if (!Enum.TryParse<AllergenSeverity>(updatedAllergy.Severity, out var severity))
                {
                    return TypedResults.BadRequest("Invalid severity value.");
                }

                allergy.Severity = severity;
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while updating allergy {AllergyId} for patient {PatientId}",
                allergyId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}

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
public class PrescriptionController(
    ILogger<PrescriptionController> logger,
    HealthRecordsDbContext db) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<List<PrescriptionDto>>, NotFound<string>, StatusCodeHttpResult>> GetPrescriptions(
        [FromRoute] int patientId)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.Prescriptions).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var prescriptions = patient.Prescriptions.Select(p => new PrescriptionDto
            {
                Id = p.Id,
                Name = p.Name,
                Dosage = p.Dosage,
                DosageUnit = p.DosageUnit.ToString(),
                DosagePerKilogram = p.DosagePerKilogram,
                Frequency = p.Frequency,
                FrequencyUnit = p.FrequencyUnit.ToString(),
                Duration = p.Duration,
                DurationUnit = p.DurationUnit.ToString(),
                PatientId = p.PatientId
            }).ToList();
            return TypedResults.Ok(prescriptions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while getting prescriptions for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("{prescriptionId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<PrescriptionDto>, NotFound<string>, StatusCodeHttpResult>> GetPrescription(
        [FromRoute] int patientId, [FromRoute] int prescriptionId)
    {
        try
        {
            var prescription =
                await db.Prescriptions.Where(p => p.Id == prescriptionId && p.PatientId == patientId).Select(p => new PrescriptionDto
            {
                Id = p.Id,
                Name = p.Name,
                Dosage = p.Dosage,
                DosageUnit = p.DosageUnit.ToString(),
                DosagePerKilogram = p.DosagePerKilogram,
                Frequency = p.Frequency,
                FrequencyUnit = p.FrequencyUnit.ToString(),
                Duration = p.Duration,
                DurationUnit = p.DurationUnit.ToString(),
                PatientId = p.PatientId
            }).FirstOrDefaultAsync();
            if (prescription == null)
            {
                return TypedResults.NotFound("Prescription not found for this patient.");
            }

            return TypedResults.Ok(prescription);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while getting prescription {PrescriptionId} for patient {PatientId}",
                prescriptionId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> CreatePrescription(
        [FromRoute] int patientId, [FromBody] CreatePrescriptionFb model)
    {
        try
        {
            var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var prescription = new Prescription
            {
                Name = model.Name,
                Dosage = model.Dosage,
                DosageUnit = Enum.Parse<DosageUnit>(model.DosageUnit),
                DosagePerKilogram = model.DosagePerKilogram,
                Frequency = model.Frequency,
                FrequencyUnit = Enum.Parse<FrequencyUnit>(model.FrequencyUnit),
                Duration = model.Duration,
                DurationUnit = Enum.Parse<DurationUnit>(model.DurationUnit),
                PatientId = patientId,
                Patient = patient
            };
            db.Prescriptions.Add(prescription);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating prescription for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPut("{prescriptionId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> UpdatePrescription(
        [FromRoute] int patientId, [FromRoute] int prescriptionId, [FromBody] UpdatePrescriptionFb model)
    {
        try
        {
            var prescription =
                await db.Prescriptions.FirstOrDefaultAsync(p => p.Id == prescriptionId && p.PatientId == patientId);
            if (prescription == null)
            {
                return TypedResults.NotFound("Prescription not found for this patient.");
            }

            if (model.Name != null) prescription.Name = model.Name;
            if (model.Dosage.HasValue) prescription.Dosage = model.Dosage.Value;
            if (model.DosageUnit != null) prescription.DosageUnit = Enum.Parse<DosageUnit>(model.DosageUnit);
            if (model.DosagePerKilogram.HasValue) prescription.DosagePerKilogram = model.DosagePerKilogram.Value;
            if (model.Frequency.HasValue) prescription.Frequency = model.Frequency.Value;
            if (model.FrequencyUnit != null)
                prescription.FrequencyUnit = Enum.Parse<FrequencyUnit>(model.FrequencyUnit);
            if (model.Duration.HasValue) prescription.Duration = model.Duration.Value;
            if (model.DurationUnit != null) prescription.DurationUnit = Enum.Parse<DurationUnit>(model.DurationUnit);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "An error occurred while updating prescription {PrescriptionId} for patient {PatientId}",
                prescriptionId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpDelete("{prescriptionId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> DeletePrescription(
        [FromRoute] int patientId, [FromRoute] int prescriptionId)
    {
        try
        {
            var prescription =
                await db.Prescriptions.FirstOrDefaultAsync(p => p.Id == prescriptionId && p.PatientId == patientId);
            if (prescription == null)
            {
                return TypedResults.NotFound("Prescription not found for this patient.");
            }

            db.Prescriptions.Remove(prescription);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "An error occurred while deleting prescription {PrescriptionId} for patient {PatientId}",
                prescriptionId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}

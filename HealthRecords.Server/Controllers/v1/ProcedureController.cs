using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/patient/{patientId:int}/healthrecord/{healthRecordId:int}/[controller]")]
[Produces("application/json")]
public class ProcedureController(
    ILogger<ProcedureController> logger,
    HealthRecordsDbContext db) : ControllerBase {
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<List<ProcedureDto>>, NotFound<string>, StatusCodeHttpResult>> GetProcedures(
        [FromRoute] int patientId, [FromRoute] int healthRecordId) {
        try {
            var healthRecord = await db.HealthRecords
                .Include(hr => hr.Procedures)
                .FirstOrDefaultAsync(hr => hr.Id == healthRecordId && hr.PatientId == patientId);
            if (healthRecord == null) {
                return TypedResults.NotFound("Health record not found for this patient.");
            }
            var procedures = healthRecord.Procedures.Select(p => new ProcedureDto {
                Id = p.Id,
                Name = p.Name,
                Category = p.Category.ToString(),
                Notes = p.Notes,
                Date = p.Date.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                HealthRecordId = p.HealthRecordId,
                AttendingDoctorId = p.AttendingDoctor.Id
            }).ToList();
            return TypedResults.Ok(procedures);
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while getting procedures for patient {PatientId} and health record {HealthRecordId}", patientId, healthRecordId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("{procedureId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<ProcedureDto>, NotFound<string>, StatusCodeHttpResult>> GetProcedure(
        [FromRoute] int patientId, [FromRoute] int healthRecordId, [FromRoute] int procedureId) {
        try {
            var procedure = await db.Procedures
                .Include(p => p.AttendingDoctor)
                .Where(p => p.Id == procedureId && p.HealthRecordId == healthRecordId && p.HealthRecord.PatientId == patientId)
                .Select(p => new ProcedureDto {
                Id = p.Id,
                Name = p.Name,
                Category = p.Category.ToString(),
                Notes = p.Notes,
                Date = p.Date.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                HealthRecordId = p.HealthRecordId,
                AttendingDoctorId = p.AttendingDoctor.Id
            })
                .FirstOrDefaultAsync();
            if (procedure == null) {
                return TypedResults.NotFound("Procedure not found for this health record and patient.");
            }

            return TypedResults.Ok(procedure);
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while getting procedure {ProcedureId} for patient {PatientId} and health record {HealthRecordId}", procedureId, patientId, healthRecordId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> CreateProcedure(
        [FromRoute] int patientId, [FromRoute] int healthRecordId, [FromBody] CreateProcedureFb model) {
        try {
            var healthRecord = await db.HealthRecords
                .Include(hr => hr.Patient)
                .FirstOrDefaultAsync(hr => hr.Id == healthRecordId && hr.PatientId == patientId);
            if (healthRecord == null) {
                return TypedResults.NotFound("Health record not found for this patient.");
            }
            if (!Enum.TryParse<ProcedureCategory>(model.Category, out var category)) {
                return TypedResults.NotFound("Invalid procedure category.");
            }
            var doctor = await db.Staff.FirstOrDefaultAsync(s => s.Id == model.AttendingDoctorId);
            if (doctor == null) {
                return TypedResults.NotFound("Attending doctor not found.");
            }
            var procedure = new Procedure {
                Name = model.Name,
                Category = category,
                Notes = model.Notes,
                Date = DateTime.Parse(model.Date, null, DateTimeStyles.RoundtripKind),
                HealthRecordId = healthRecordId,
                HealthRecord = healthRecord,
                AttendingDoctor = doctor
            };
            db.Procedures.Add(procedure);
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while creating procedure for patient {PatientId} and health record {HealthRecordId}", patientId, healthRecordId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPut("{procedureId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> UpdateProcedure(
        [FromRoute] int patientId, [FromRoute] int healthRecordId, [FromRoute] int procedureId, [FromBody] UpdateProcedureFb model) {
        try {
            var procedure = await db.Procedures
                .Include(p => p.AttendingDoctor)
                .FirstOrDefaultAsync(p => p.Id == procedureId && p.HealthRecordId == healthRecordId && p.HealthRecord.PatientId == patientId);
            if (procedure == null) {
                return TypedResults.NotFound("Procedure not found for this health record and patient.");
            }
            if (!Enum.TryParse<ProcedureCategory>(model.Category, out var category)) {
                return TypedResults.NotFound("Invalid procedure category.");
            }
            var doctor = await db.Staff.FirstOrDefaultAsync(s => s.Id == model.AttendingDoctorId);
            if (doctor == null) {
                return TypedResults.NotFound("Attending doctor not found.");
            }
            procedure.Name = model.Name;
            procedure.Category = category;
            procedure.Notes = model.Notes;
            procedure.Date = DateTime.Parse(model.Date, null, DateTimeStyles.RoundtripKind);
            procedure.AttendingDoctor = doctor;
            await db.SaveChangesAsync();

            return TypedResults.Ok();
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while updating procedure {ProcedureId} for patient {PatientId} and health record {HealthRecordId}", procedureId, patientId, healthRecordId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpDelete("{procedureId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> DeleteProcedure(
        [FromRoute] int patientId, [FromRoute] int healthRecordId, [FromRoute] int procedureId) {
        try {
            var procedure = await db.Procedures
                .FirstOrDefaultAsync(p => p.Id == procedureId && p.HealthRecordId == healthRecordId && p.HealthRecord.PatientId == patientId);
            if (procedure == null) {
                return TypedResults.NotFound("Procedure not found for this health record and patient.");
            }
            db.Procedures.Remove(procedure);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        } catch (Exception ex) {
            logger.LogError(ex, "An error occurred while deleting procedure {ProcedureId} for patient {PatientId} and health record {HealthRecordId}", procedureId, patientId, healthRecordId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}

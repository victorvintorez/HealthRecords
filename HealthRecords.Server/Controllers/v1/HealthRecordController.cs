using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using HealthRecords.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/patient/{patientId:int}/[controller]")]
[Produces("application/json")]
public class HealthRecordController(
    ILogger<HealthRecordController> logger,
    HealthRecordsDbContext db,
    BlobServiceClient blobServiceClient,
    SasTokenService sasTokenService) : ControllerBase
{
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<List<HealthRecordDto>>, NotFound<string>, StatusCodeHttpResult>> GetHealthRecords(
        [FromRoute] int patientId)
    {
        try
        {
            var patient = await db.Patients.Include(p => p.HealthRecords).FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var healthRecords = await db.HealthRecords
                .Include(hr => hr.Hospital)
                .Include(hr => hr.AttendingDoctor)
                .Include(hr => hr.Files)
                .Where(hr => hr.PatientId == patientId)
                .ToListAsync();
            var healthRecordDtos = new List<HealthRecordDto>();
            foreach (var hr in healthRecords)
            {
                var fileUrls = new List<string>();
                foreach (var file in hr.Files)
                {
                    if (string.IsNullOrEmpty(file.FileName)) continue;
                    var url = await sasTokenService.GetSasUriAsync(
                        hr.AttendingDoctor.AccountId,
                        file.Container,
                        file.FileName
                    );
                    fileUrls.Add(url);
                }

                healthRecordDtos.Add(new HealthRecordDto
                {
                    Id = hr.Id,
                    Date = hr.Date.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                    Reason = hr.Reason.ToString(),
                    Complaint = hr.Complaint,
                    Notes = hr.Notes,
                    Diagnosis = hr.Diagnosis,
                    PatientId = hr.PatientId,
                    HospitalId = hr.Hospital.Id,
                    AttendingDoctorId = hr.AttendingDoctor.Id,
                    FileUrls = fileUrls
                });
            }

            return TypedResults.Ok(healthRecordDtos);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while getting health records for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpGet("{healthRecordId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<HealthRecordDto>, NotFound<string>, StatusCodeHttpResult>> GetHealthRecord(
        [FromRoute] int patientId, [FromRoute] int healthRecordId)
    {
        try
        {
            var hr = await db.HealthRecords
                .Include(h => h.Hospital)
                .Include(h => h.AttendingDoctor)
                .Include(h => h.Files)
                .FirstOrDefaultAsync(h => h.Id == healthRecordId && h.PatientId == patientId);
            if (hr == null)
            {
                return TypedResults.NotFound("Health record not found for this patient.");
            }

            var fileUrls = new List<string>();
            foreach (var file in hr.Files)
            {
                if (string.IsNullOrEmpty(file.FileName)) continue;
                var url = await sasTokenService.GetSasUriAsync(
                    hr.AttendingDoctor.AccountId,
                    file.Container,
                    file.FileName
                );
                fileUrls.Add(url);
            }

            var dto = new HealthRecordDto
            {
                Id = hr.Id,
                Date = hr.Date.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                Reason = hr.Reason.ToString(),
                Complaint = hr.Complaint,
                Notes = hr.Notes,
                Diagnosis = hr.Diagnosis,
                PatientId = hr.PatientId,
                HospitalId = hr.Hospital.Id,
                AttendingDoctorId = hr.AttendingDoctor.Id,
                FileUrls = fileUrls
            };
            return TypedResults.Ok(dto);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "An error occurred while getting health record {HealthRecordId} for patient {PatientId}",
                healthRecordId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> CreateHealthRecord(
        [FromRoute] int patientId, [FromForm] CreateHealthRecordFb model)
    {
        try
        {
            var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == patientId);
            if (patient == null)
            {
                return TypedResults.NotFound("Patient not found.");
            }

            var hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == model.HospitalId);
            if (hospital == null)
            {
                return TypedResults.NotFound("Hospital not found.");
            }

            var doctor = await db.Staff.FirstOrDefaultAsync(s => s.Id == model.AttendingDoctorId);
            if (doctor == null)
            {
                return TypedResults.NotFound("Attending doctor not found.");
            }

            var healthRecord = new HealthRecord
            {
                Date = DateTime.Parse(model.Date, null, DateTimeStyles.RoundtripKind),
                Reason = Enum.Parse<IntakeReason>(model.Reason),
                Complaint = model.Complaint,
                Notes = model.Notes,
                Diagnosis = model.Diagnosis,
                PatientId = patientId,
                Patient = patient,
                Hospital = hospital,
                AttendingDoctor = doctor
            };
            if (model.Files is { Count: > 0 })
            {
                foreach (var formFile in model.Files)
                {
                    if (formFile.Length <= 0) continue;
                    var filename =
                        $"{doctor.AccountId}_healthrecord_{Guid.NewGuid()}.{formFile.FileName.Split('.').Last()}";
                    var blobClient = blobServiceClient.GetBlobContainerClient("healthrecord-files")
                        .GetBlobClient(filename);
                    await blobClient.UploadAsync(formFile.OpenReadStream());
                    var fileBlob = new FileBlob
                    {
                        FileName = filename,
                        ContentType = formFile.ContentType,
                        Container = blobClient.BlobContainerName
                    };
                    healthRecord.Files.Add(fileBlob);
                    db.FileBlobs.Add(fileBlob);
                }
            }

            db.HealthRecords.Add(healthRecord);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while creating health record for patient {PatientId}", patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpPut("{healthRecordId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> UpdateHealthRecord(
        [FromRoute] int patientId, [FromRoute] int healthRecordId, [FromForm] UpdateHealthRecordFb model)
    {
        try
        {
            var hr = await db.HealthRecords
                .Include(h => h.Hospital)
                .Include(h => h.AttendingDoctor)
                .Include(h => h.Files)
                .FirstOrDefaultAsync(h => h.Id == healthRecordId && h.PatientId == patientId);
            if (hr == null)
            {
                return TypedResults.NotFound("Health record not found for this patient.");
            }

            if (model.Date != null) hr.Date = DateTime.Parse(model.Date, null, DateTimeStyles.RoundtripKind);
            if (model.Reason != null) hr.Reason = Enum.Parse<IntakeReason>(model.Reason);
            if (model.Complaint != null) hr.Complaint = model.Complaint;
            if (model.Notes != null) hr.Notes = model.Notes;
            if (model.Diagnosis != null) hr.Diagnosis = model.Diagnosis;
            if (model.HospitalId.HasValue)
            {
                var hospital = await db.Hospitals.FirstOrDefaultAsync(h => h.Id == model.HospitalId.Value);
                if (hospital == null)
                {
                    return TypedResults.NotFound("Hospital not found.");
                }

                hr.Hospital = hospital;
            }

            if (model.AttendingDoctorId.HasValue)
            {
                var doctor = await db.Staff.FirstOrDefaultAsync(s => s.Id == model.AttendingDoctorId.Value);
                if (doctor == null)
                {
                    return TypedResults.NotFound("Attending doctor not found.");
                }

                hr.AttendingDoctor = doctor;
            }

            if (model.Files is { Count: > 0 })
            {
                foreach (var formFile in model.Files)
                {
                  if (formFile.Length <= 0) continue;
                  var filename =
                    $"{hr.AttendingDoctor.AccountId}_healthrecord_{Guid.NewGuid()}.{formFile.FileName.Split('.').Last()}";
                  var blobClient = blobServiceClient.GetBlobContainerClient("healthrecord-files")
                    .GetBlobClient(filename);
                  await blobClient.UploadAsync(formFile.OpenReadStream());
                  var fileBlob = new FileBlob
                  {
                    FileName = filename,
                    ContentType = formFile.ContentType,
                    Container = blobClient.BlobContainerName
                  };
                  hr.Files.Add(fileBlob);
                  db.FileBlobs.Add(fileBlob);
                }
            }

            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "An error occurred while updating health record {HealthRecordId} for patient {PatientId}",
                healthRecordId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }

    [HttpDelete("{healthRecordId:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok, NotFound<string>, StatusCodeHttpResult>> DeleteHealthRecord(
        [FromRoute] int patientId, [FromRoute] int healthRecordId)
    {
        try
        {
            var hr = await db.HealthRecords
                .Include(h => h.Files)
                .FirstOrDefaultAsync(h => h.Id == healthRecordId && h.PatientId == patientId);
            if (hr == null)
            {
                return TypedResults.NotFound("Health record not found for this patient.");
            }

            foreach (var file in hr.Files)
            {
                var blobClient = blobServiceClient.GetBlobContainerClient("healthrecord-files")
                    .GetBlobClient(file.FileName);
                await blobClient.DeleteIfExistsAsync();
                db.FileBlobs.Remove(file);
            }

            db.HealthRecords.Remove(hr);
            await db.SaveChangesAsync();
            return TypedResults.Ok();
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "An error occurred while deleting health record {HealthRecordId} for patient {PatientId}",
                healthRecordId, patientId);
            return TypedResults.StatusCode(StatusCodes.Status500InternalServerError);
        }
    }
}

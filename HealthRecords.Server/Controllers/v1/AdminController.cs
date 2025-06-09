using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Dto;
using HealthRecords.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class AdminController(
    ILogger<AdminController> logger,
    FakeGenerator fakeGenerator,
    HealthRecordsDbContext db
) : ControllerBase {
    [HttpPost("generate/patients")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GeneratePatients([FromQuery] int count = 1)
    {
        logger.LogInformation("GeneratePatients called with count={Count}", count);
        var result = await fakeGenerator.CreateFakePatientsAsync(count);
        logger.LogInformation("GeneratePatients result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/generalpractitioners")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateGeneralPractitioners([FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateGeneralPractitioners called with count={Count}", count);
        var result = await fakeGenerator.CreateFakeGeneralPractitionersAsync(count);
        logger.LogInformation("GenerateGeneralPractitioners result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/allergies")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateAllergies([FromQuery] int patientId, [FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateAllergies called with patientId={PatientId}, count={Count}", patientId, count);
        var result = await fakeGenerator.CreateFakeAllergiesAsync(patientId, count);
        logger.LogInformation("GenerateAllergies result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/emergencycontacts")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateEmergencyContacts([FromQuery] int patientId, [FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateEmergencyContacts called with patientId={PatientId}, count={Count}", patientId, count);
        var result = await fakeGenerator.CreateFakeEmergencyContactsAsync(patientId, count);
        logger.LogInformation("GenerateEmergencyContacts result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/healthrecords")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateHealthRecords([FromQuery] int patientId, [FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateHealthRecords called with patientId={PatientId}, count={Count}", patientId, count);
        var result = await fakeGenerator.CreateFakeHealthRecordAsync(patientId, count);
        logger.LogInformation("GenerateHealthRecords result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/hospitals")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateHospitals([FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateHospitals called with count={Count}", count);
        var result = await fakeGenerator.CreateFakeHospitalsAsync(count);
        logger.LogInformation("GenerateHospitals result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/prescriptions")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GeneratePrescriptions([FromQuery] int patientId, [FromQuery] int count = 1)
    {
        logger.LogInformation("GeneratePrescriptions called with patientId={PatientId}, count={Count}", patientId, count);
        var result = await fakeGenerator.CreateFakePrescriptionsAsync(patientId, count);
        logger.LogInformation("GeneratePrescriptions result: {@Result}", result);
        return Ok(result);
    }

    [HttpPost("generate/procedures")]
    public async Task<ActionResult<FakeGenerator.FakeResult>> GenerateProcedures([FromQuery] int healthRecordId, [FromQuery] int count = 1)
    {
        logger.LogInformation("GenerateProcedures called with healthRecordId={HealthRecordId}, count={Count}", healthRecordId, count);
        var result = await fakeGenerator.CreateFakeProceduresAsync(healthRecordId, count);
        logger.LogInformation("GenerateProcedures result: {@Result}", result);
        return Ok(result);
    }

    [HttpGet("counts")]
    public async Task<Ok<AdminCountDto[]>> GetAllCounts()
    {
        var counts = new[] {
            new AdminCountDto {
                TableName = "Patients",
                RowCount = await db.Patients.CountAsync(),
                GenerateFromAdminPanel = true
            },
            new AdminCountDto
            {
              TableName = "Allergies",
              RowCount = await db.Allergies.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "General Practitioners",
              RowCount = await db.GeneralPractitioners.CountAsync(),
              GenerateFromAdminPanel = true
            },
            new AdminCountDto
            {
              TableName = "Emergency Contacts",
              RowCount = await db.EmergencyContacts.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "Hospitals",
              RowCount = await db.Hospitals.CountAsync(),
              GenerateFromAdminPanel = true
            },
            new AdminCountDto
            {
              TableName = "Staff",
              RowCount = await db.Staff.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "Prescriptions",
              RowCount = await db.Prescriptions.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "Procedures",
              RowCount = await db.Procedures.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "Health Records",
              RowCount = await db.HealthRecords.CountAsync(),
              GenerateFromAdminPanel = false
            },
            new AdminCountDto
            {
              TableName = "File Blobs",
              RowCount = await db.FileBlobs.CountAsync(),
              GenerateFromAdminPanel = false
            }
        };
        return TypedResults.Ok(counts);
    }
}
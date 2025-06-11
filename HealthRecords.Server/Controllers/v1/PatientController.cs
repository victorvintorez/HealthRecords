using System.Globalization;
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
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class PatientController(
    ILogger<AuthController> logger,
    HealthRecordsDbContext db) : ControllerBase {
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok<PatientPageDto>, NotFound<string>, InternalServerError<string>>> GetPatientAll([FromQuery] int page = 0) {
        const int top = 20;
        var skip = page >= 1 ? page - 1 : 0;

        var patients = await db.Patients
            .Include(p => p.GeneralPractitioner)
            .OrderBy(p => p.FullName)
            .ThenBy(p => p.Id)
            .Skip(skip * top)
            .Take(top)
            .Select(p => new PatientDto {
                Id = p.Id,
                FullName = p.FullName,
                Address = p.Address,
                PhoneNumber = p.PhoneNumber,
                DateOfBirth = p.DateOfBirth.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                Gender = p.Gender.ToString(),
                Sex = p.Sex.ToString(),
                Weight = p.Weight,
                Height = p.Height,
                BloodType = p.BloodType.ToString(),
                GeneralPractitionerId = p.GeneralPractitioner.Id,
            }).ToListAsync();
            
        return TypedResults.Ok(new PatientPageDto {
            Patients = patients,
            Cursor = patients.Count == top ? page + 1 : null
        });
    }

    [HttpGet("{id:int}", Name = "GetPatientById")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<Results<Ok<PatientDto>, NotFound<string>>> GetPatientById([FromRoute] int id) {
        var patient = await db.Patients
            .Include(p => p.GeneralPractitioner)
            .Include(p => p.Allergies)
            .Include(p => p.EmergencyContacts)
            .Include(p => p.Prescriptions)
            .Include(p => p.HealthRecords)
            .Where(p => p.Id == id)
            .Select(p => new PatientDto {
                Id = 0,
                FullName = p.FullName,
                Address = p.Address,
                PhoneNumber = p.PhoneNumber,
                DateOfBirth = p.DateOfBirth.ToUniversalTime().ToString(CultureInfo.InvariantCulture),
                Gender = p.Gender.ToString(),
                Sex = p.Sex.ToString(),
                Weight = p.Weight,
                Height = p.Height,
                BloodType = p.BloodType.ToString(),
                GeneralPractitionerId = p.GeneralPractitioner.Id,
                AllergyIds = p.Allergies.Select(a => a.Id).ToList(),
                EmergencyContactIds = p.EmergencyContacts.Select(ec => ec.Id).ToList(),
                PrescriptionIds = p.Prescriptions.Select(pr => pr.Id).ToList(),
                HealthRecordIds = p.HealthRecords.Select(hr => hr.Id).ToList()
            }).FirstOrDefaultAsync();
        
        if (patient == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }
        
        return TypedResults.Ok(patient);
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, BadRequest<string>, InternalServerError<string>>> CreatePatient(
        [FromBody] CreatePatientFb body, [FromQuery] bool force) {
        // Convert Date of Birth
        var successDoB = DateTime.TryParse(body.DateOfBirth, out DateTime dateOfBirth);
        if (!successDoB) {
            return TypedResults.BadRequest("Invalid date of birth.");
        }
        
        // Convert Gender
        var successGender = Enum.TryParse(body.Gender, out Gender gender);
        if (!successGender) {
            return TypedResults.BadRequest("Invalid Gender.");
        }
        
        // Convert Sex
        var successSex = Enum.TryParse(body.Sex, out Sex sex);
        if (!successSex) {
            return TypedResults.BadRequest("Invalid Sex.");
        }
        
        // Convert Blood Type
        var successBloodType = Enum.TryParse(body.BloodType, out BloodType bloodType);
        if (!successBloodType) {
            return TypedResults.BadRequest("Invalid Blood Type.");
        }
        
        // Check if the patient already exists
        // (Full Name, Date Of Birth, Sex, Blood Type are all the same)
        // overridden with the `force` query param
        if (!force) {
            if (await db.Patients.AnyAsync(p =>
                    p.FullName == body.FullName && 
                    p.DateOfBirth == dateOfBirth && 
                    p.Sex == sex &&
                    p.BloodType == bloodType)) {
                return TypedResults.BadRequest("Patient already exists.");
            }
        }
        
        // Check if General Practitioner exists
        var gp = await db.GeneralPractitioners.FirstOrDefaultAsync(gp => gp.Id == body.GeneralPractitionerId);
        if (gp == null) {
            return TypedResults.BadRequest("General Practitioner ID is invalid.");
        }
        
        // Create Patient
        db.Patients.Add(new Patient {
            FullName = body.FullName,
            Address = body.Address,
            PhoneNumber = body.PhoneNumber,
            DateOfBirth = dateOfBirth,
            Gender = gender,
            Sex = sex,
            Weight = body.Weight,
            Height = body.Weight,
            BloodType = bloodType,
            GeneralPractitioner = gp
        });
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't create new patient record");
            return TypedResults.InternalServerError("Couldn't create new patient record.");
        }
        
        return TypedResults.Ok();
    }

    [HttpDelete("{id:int}", Name = "DeletePatientById")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>>
        DeletePatientById([FromRoute] int id) {
        // Check if the patient exists
        var patient = await db.Patients.FirstOrDefaultAsync(p => p.Id == id);
        if (patient == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }

        // Delete the patient
        db.Patients.Remove(patient);
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't delete patient record");
            return TypedResults.InternalServerError("Couldn't delete patient record.");
        }

        return TypedResults.Ok();
    }

    [HttpPatch("{id:int}", Name = "UpdatePatientById")]
    [Authorize(Roles = "Administrator")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<Results<Ok, NotFound<string>, BadRequest<string>, InternalServerError<string>>> UpdatePatientById(
        [FromRoute] int id, [FromBody] UpdatePatientFb body) {
        // Check if the patient exists
        var patient = await db.Patients.Include(p => p.GeneralPractitioner).FirstOrDefaultAsync(p => p.Id == id);
        if (patient == null) {
            return TypedResults.NotFound("Couldn't find a record with the provided ID.");
        }
        
        // Update FullName
        if (body.FullName != null && body.FullName != patient.FullName) {
            patient.FullName = body.FullName;
        }
        
        // Update Address
        if (body.Address != null && body.Address != patient.Address) {
            patient.Address = body.Address;
        }
        
        // Update PhoneNumber
        if (body.PhoneNumber != null && body.PhoneNumber != patient.PhoneNumber) {
            patient.PhoneNumber = body.PhoneNumber;
        }
        
        // Update DateOfBirth
        if (body.DateOfBirth != null) {
            var successDoB = DateTime.TryParse(body.DateOfBirth, out DateTime dateOfBirth);
            if (!successDoB) {
                return TypedResults.BadRequest("Invalid date of birth.");
            }
            if (dateOfBirth != patient.DateOfBirth) {
                patient.DateOfBirth = dateOfBirth;
            }
        }
        
        // Update Gender
        if (body.Gender != null) {
            var successGender = Enum.TryParse(body.Gender, out Gender gender);
            if (!successGender) {
                return TypedResults.BadRequest("Invalid Gender.");
            }
            if (gender != patient.Gender) {
                patient.Gender = gender;
            }
        }
        
        // Update Sex
        if (body.Sex != null) {
            var successSex = Enum.TryParse(body.Sex, out Sex sex);
            if (!successSex) {
                return TypedResults.BadRequest("Invalid Sex.");
            }
            if (sex != patient.Sex) {
                patient.Sex = sex;
            }
        }
        
        // Update Weight
        if (body.Weight is { } weight && body.Weight.Equals(patient.Weight)) {
            patient.Weight = weight;
        }
        
        // Update Height
        if (body.Height is { } height && body.Height.Equals(patient.Height)) {
            patient.Height = height;
        }
        
        // Update BloodType
        if (body.BloodType != null) {
            var successBloodType = Enum.TryParse(body.BloodType, out BloodType bloodType);
            if (!successBloodType) {
                return TypedResults.BadRequest("Invalid Blood Type.");
            }
            if (bloodType != patient.BloodType) {
                patient.BloodType = bloodType;
            }
        }
        
        // Check if a general practitioner exists
        if (body.GeneralPractitionerId != null && body.GeneralPractitionerId != patient.GeneralPractitioner.Id) {
            var gp = await db.GeneralPractitioners.FirstOrDefaultAsync(gp => gp.Id == body.GeneralPractitionerId);
            if (gp == null) {
                return TypedResults.BadRequest("General Practitioner ID is invalid.");
            }
            patient.GeneralPractitioner = gp;
        }
        
        // Save updates
        try {
            await db.SaveChangesAsync();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Couldn't update patient record");
            return TypedResults.InternalServerError("Couldn't update patient record.");
        }
        
        return TypedResults.Ok();
    }
}
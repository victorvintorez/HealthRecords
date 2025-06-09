using System.Globalization;
using Bogus;
using Bogus.Extensions.UnitedKingdom;
using CountryData.Bogus;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Models.FromBody;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Services;

public class FakeGenerator(HealthRecordsDbContext db) {
    public async Task<FakeResult> CreateFakePatientsAsync(int count = 1) {
        // fetch all general practitioner id's from the database
        var generalPractitionerIds = await db.GeneralPractitioners.Select(gp => gp.Id).ToListAsync();
        if (generalPractitionerIds.Count == 0) {
            return new FakeResult {
                Success = false,
                Message = "No general practitioners found in the database."
            };
        }

        // create a faker instance for generating patient data
        var faker = new Faker<CreatePatientFb>()
        .RuleFor(x => x.FullName, f => f.Name.FullName())
        .RuleFor(x => x.Address, f => $"{f.Address.StreetAddress()}, {CountryDataSet.UnitedKingdom().Area}, {f.Address.CountryOfUnitedKingdom()}, {CountryDataSet.UnitedKingdom().PostCode()}")
        .RuleFor(x => x.PhoneNumber, f => $"+44 {f.Phone.PhoneNumber("#### ### ###")}")
        .RuleFor(x => x.DateOfBirth, f => f.Person.DateOfBirth.ToUniversalTime().ToString(CultureInfo.InvariantCulture))
        .RuleFor(x => x.Gender, f => f.PickRandom<Gender>().ToString())
        .RuleFor(x => x.Sex, f => f.PickRandom<Sex>().ToString())
        .RuleFor(x => x.Weight, f => f.Random.Float(30f, 200f))
        .RuleFor(x => x.Height, f => f.Random.Float(1.5f, 2.2f))
        .RuleFor(x => x.BloodType, f => f.PickRandom<BloodType>().ToString())
        .RuleFor(x => x.GeneralPractitionerId, f => f.PickRandom(generalPractitionerIds));

        // generate the specified number of patients
        var patients = faker.Generate(count);
        
        // add the generated patients to the database
        foreach (var patient in patients) {
            // get the general practitioner from the database
            var gp = await db.GeneralPractitioners
                .FindAsync(patient.GeneralPractitionerId);
            if (gp == null) {
                return new FakeResult {
                    Success = false,
                    Message = $"General Practitioner with ID {patient.GeneralPractitionerId} does not exist."
                };
            }
            
            db.Patients.Add(new Patient
            {
              FullName = patient.FullName,
              Address = patient.Address,
              PhoneNumber = patient.PhoneNumber,
              DateOfBirth = DateTime.Parse(patient.DateOfBirth,
                CultureInfo.InvariantCulture),
              Gender = Enum.Parse<Gender>(patient.Gender),
              Sex = Enum.Parse<Sex>(patient.Sex),
              Weight = patient.Weight,
              Height = patient.Height,
              BloodType = Enum.Parse<BloodType>(patient.BloodType),
              GeneralPractitioner = gp,
            });
        }

        // save changes to the database
        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving patients to the database: {ex.Message}"
            };
        }
        return new FakeResult {
            Success = true,
            Message = $"{count} fake patients created successfully."
        };
    }
    
    public async Task<FakeResult> CreateFakeGeneralPractitionersAsync(int count = 1) {
        // create a faker instance for generating general practitioner data
        var faker = new Faker<CreateGeneralPractitionerFb>()
            .RuleFor(x => x.SurgeryName, f => f.Address.StreetName() + " Surgery")
            .RuleFor(x => x.Address, f => $"{f.Address.StreetAddress()}, {CountryDataSet.UnitedKingdom().Area}, {f.Address.CountryOfUnitedKingdom()}, {CountryDataSet.UnitedKingdom().PostCode()}")
            .RuleFor(x => x.PhoneNumber, f => $"+44 {f.Phone.PhoneNumber("#### ### ###")}")
            .RuleFor(x => x.Email, f => f.Internet.Email().OrNull(f))
            .RuleFor(x => x.Website, f => f.Internet.Url().OrNull(f));

        // generate the specified number of general practitioners
        var generalPractitioners = faker.Generate(count);

        // add the generated general practitioners to the database
        foreach (var gp in generalPractitioners) {
            db.GeneralPractitioners.Add(new GeneralPractitioner
            {
                SurgeryName = gp.SurgeryName,
                Address = gp.Address,
                PhoneNumber = gp.PhoneNumber,
                Email = gp.Email,
                Website = gp.Website
            });
        }

        // save changes to the database
        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving general practitioners to the database: {ex.Message}"
            };
        }
        return new FakeResult {
            Success = true,
            Message = $"{count} fake general practitioners created successfully."
        };
    }

    public async Task<FakeResult> CreateFakeAllergiesAsync(int patientId, int count = 1) {
        // check if the patient exists in the database
        var patient = await db.Patients.FindAsync(patientId);
        if (patient == null) {
            return new FakeResult {
                Success = false,
                Message = $"Patient with ID {patientId} does not exist."
            };
        }
        // create a faker instance for generating allergy data
        var faker = new Faker<CreateAllergyFb>()
            .RuleFor(x => x.Name, f => string.Join(" ", f.Lorem.Words(2)))
            .RuleFor(x => x.CommonName, f => string.Join(" ", f.Lorem.Words(2)))
            .RuleFor(x => x.Severity, f => f.PickRandom<AllergenSeverity>().ToString());

        // generate the specified number of allergies
        var allergies = faker.Generate(count);

        // add the generated allergies to the database
        foreach (var allergy in allergies) {
            var allergyEntity = db.Allergies.Add(new Allergy
            {
                Name = allergy.Name,
                CommonName = allergy.CommonName,
                Severity = Enum.Parse<AllergenSeverity>(allergy.Severity)
            });

            patient.Allergies.Add(allergyEntity.Entity);
        }

        // save changes to the database
        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving allergies to the database: {ex.Message}"
            };
        }
        return new FakeResult {
            Success = true,
            Message = $"{count} fake allergies created successfully."
        };
    }

    public async Task<FakeResult> CreateFakeEmergencyContactsAsync(int patientId, int count = 1) {
        // check if the patient exists in the database
        var patient = await db.Patients.FindAsync(patientId);
        if (patient == null) {
            return new FakeResult {
                Success = false,
                Message = $"Patient with ID {patientId} does not exist."
            };
        }
        // create a faker instance for generating emergency contact data
        var faker = new Faker<CreateEmergencyContactFb>()
            .RuleFor(x => x.FullName, f => f.Name.FullName())
            .RuleFor(x => x.Relationship, f => f.PickRandom<Relationship>().ToString())
            .RuleFor(x => x.PhoneNumber, f => $"+44 {f.Phone.PhoneNumber("#### ### ###")}");

        // generate the specified number of emergency contacts
        var emergencyContacts = faker.Generate(count);

        // add the generated emergency contacts to the database
        foreach (var contact in emergencyContacts) {
            db.EmergencyContacts.Add(new EmergencyContact
            {
              FullName = contact.FullName,
              Relationship = Enum.Parse<Relationship>(contact.Relationship),
              PhoneNumber = contact.PhoneNumber,
              PatientId = patientId,
              Patient = patient
            });
        }

        // save changes to the database
        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving emergency contacts to the database: {ex.Message}"
            };
        }
        return new FakeResult {
            Success = true,
            Message = $"{count} fake emergency contacts created successfully."
        };
    }

    public async Task<FakeResult> CreateFakeHealthRecordAsync(int patientId, int count = 1) {
        // check if the patient exists in the database
        var patient = await db.Patients.FindAsync(patientId);
        if (patient == null) {
            return new FakeResult {
                Success = false,
                Message = $"Patient with ID {patientId} does not exist."
            };
        }

        // fetch all hostpital ids from the database
        var hospitalIds = await db.Hospitals.Select(h => h.Id).ToListAsync();
        if (hospitalIds.Count == 0) {
            return new FakeResult {
                Success = false,
                Message = "No hospitals found in the database."
            };
        }

        // fetch all doctor ids from the database
        var doctorIds = await db.Staff.Select(d => d.Id).ToListAsync();
        if (doctorIds.Count == 0) {
            return new FakeResult {
                Success = false,
                Message = "No doctors found in the database."
            };
        }
        
        // create a faker instance for generating health record data
        var faker = new Faker<CreateHealthRecordFb>()
            .RuleFor(x => x.Date, f => f.Date.Past(5).ToUniversalTime().ToString(CultureInfo.InvariantCulture))
            .RuleFor(x => x.Reason, f => f.PickRandom<IntakeReason>().ToString())
            .RuleFor(x => x.Complaint, f => f.Lorem.Sentence(5))
            .RuleFor(x => x.Notes, f => f.Lorem.Paragraph())
            .RuleFor(x => x.Diagnosis, f => f.Lorem.Sentence().OrNull(f))
            .RuleFor(x => x.HospitalId, f => f.PickRandom(hospitalIds)) // Assuming hospital IDs are between 1 and 100
            .RuleFor(x => x.AttendingDoctorId, f => f.PickRandom(doctorIds)); // Assuming doctor IDs are between 1 and 100

        // generate the specified number of health records
        var healthRecords = faker.Generate(count);

        // add the generated health records to the database
        foreach (var record in healthRecords) {
            // get the hospital from the database
            var hospital = await db.Hospitals.FindAsync(record.HospitalId);
            if (hospital == null) {
                return new FakeResult {
                    Success = false,
                    Message = $"Hospital with ID {record.HospitalId} does not exist."
                };
            }

            // get the attending doctor from the database
            var attendingDoctor = await db.Staff.FindAsync(record.AttendingDoctorId);
            if (attendingDoctor == null) {
                return new FakeResult {
                    Success = false,
                    Message = $"Attending Doctor with ID {record.AttendingDoctorId} does not exist."
                };
            }

            db.HealthRecords.Add(new HealthRecord
            {
              Date = DateTime.Parse(record.Date),
              Reason = Enum.Parse<IntakeReason>(record.Reason),
              Complaint = record.Complaint,
              Notes = record.Notes,
              Diagnosis = record.Diagnosis,
              Hospital = hospital,
              AttendingDoctor = attendingDoctor,
              PatientId = patientId,
              Patient = patient
            });
        }

        // save changes to the database
        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving health records to the database: {ex.Message}"
            };
        }

        return new FakeResult {
            Success = true,
            Message = $"{count} fake health records created successfully."
        };
    }

    public async Task<FakeResult> CreateFakeHospitalsAsync(int count = 1) {
        var faker = new Faker<CreateHospitalFb>()
            .RuleFor(x => x.Name, _ => CountryDataSet.UnitedKingdom().Area + " University Hospital")
            .RuleFor(x => x.Address, f => $"{f.Address.StreetAddress()}, {CountryDataSet.UnitedKingdom().Area}, {f.Address.CountryOfUnitedKingdom()}, {CountryDataSet.UnitedKingdom().PostCode()}")
            .RuleFor(x => x.PhoneNumber, f => $"+44 {f.Phone.PhoneNumber("#### ### ###")}");

        var hospitals = faker.Generate(count);

        foreach (var hospital in hospitals) {
            db.Hospitals.Add(new Hospital {
                Name = hospital.Name,
                Address = hospital.Address,
                PhoneNumber = hospital.PhoneNumber
            });
        }

        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving hospitals to the database: {ex.Message}"
            };
        }

        return new FakeResult {
            Success = true,
            Message = $"{count} fake hospitals created successfully."
        };
    }

    public async Task<FakeResult> CreateFakePrescriptionsAsync(int patientId, int count = 1) {
        var patient = await db.Patients.FindAsync(patientId);
        if (patient == null) {
            return new FakeResult {
                Success = false,
                Message = $"Patient with ID {patientId} does not exist."
            };
        }
        
        var faker = new Faker<CreatePrescriptionFb>()
            .RuleFor(x => x.Name, f => string.Join(" ", f.Lorem.Words(2)))
            .RuleFor(x => x.Dosage, f => f.Random.Float(1, 50))
            .RuleFor(x => x.DosageUnit, f => f.PickRandom<DosageUnit>().ToString())
            .RuleFor(x => x.DosagePerKilogram, f => f.Random.Bool())
            .RuleFor(x => x.Frequency, f => f.Random.Int(1, 4))
            .RuleFor(x => x.FrequencyUnit, f => f.PickRandom<FrequencyUnit>().ToString())
            .RuleFor(x => x.Duration, f => f.Random.Int(1, 30))
            .RuleFor(x => x.DurationUnit, f => f.PickRandom<DurationUnit>().ToString());

        var prescriptions = faker.Generate(count);

        foreach (var prescription in prescriptions) {
            db.Prescriptions.Add(new Prescription {
                Name = prescription.Name,
                Dosage = prescription.Dosage,
                DosageUnit = Enum.Parse<DosageUnit>(prescription.DosageUnit),
                DosagePerKilogram = prescription.DosagePerKilogram,
                Frequency = prescription.Frequency,
                FrequencyUnit = Enum.Parse<FrequencyUnit>(prescription.FrequencyUnit),
                Duration = prescription.Duration,
                DurationUnit = Enum.Parse<DurationUnit>(prescription.DurationUnit),
                PatientId = patientId,
                Patient = patient
            });
        }

        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving prescriptions to the database: {ex.Message}"
            };
        }

        return new FakeResult {
            Success = true,
            Message = $"{count} fake prescriptions created successfully."
        };
    }

    public async Task<FakeResult> CreateFakeProceduresAsync(int healthRecordId, int count = 1) {
        var healthRecord = await db.HealthRecords.Include(hr => hr.Patient).FirstOrDefaultAsync(hr => hr.Id == healthRecordId);
        if (healthRecord == null) {
            return new FakeResult {
                Success = false,
                Message = $"Health record with ID {healthRecordId} does not exist."
            };
        }

        var doctorIds = await db.Staff.Select(d => d.Id).ToListAsync();
        if (doctorIds.Count == 0) {
            return new FakeResult {
                Success = false,
                Message = "No doctors found in the database."
            };
        }

        var faker = new Faker<CreateProcedureFb>()
            .RuleFor(x => x.Name, f => f.Lorem.Word() + " Procedure")
            .RuleFor(x => x.Category, f => f.PickRandom<ProcedureCategory>().ToString())
            .RuleFor(x => x.Notes, f => f.Lorem.Sentence())
            .RuleFor(x => x.Date, f => f.Date.Past(3).ToString("yyyy-MM-dd"))
            .RuleFor(x => x.AttendingDoctorId, f => f.PickRandom(doctorIds));

        var procedures = faker.Generate(count);

        foreach (var procedure in procedures) {
            var doctor = await db.Staff.FindAsync(procedure.AttendingDoctorId);

            if (doctor == null) {
                return new FakeResult {
                    Success = false,
                    Message = $"Attending Doctor with ID {procedure.AttendingDoctorId} does not exist."
                };
            }

            db.Procedures.Add(new Procedure {
                Name = procedure.Name,
                Category = Enum.Parse<ProcedureCategory>(procedure.Category),
                Notes = procedure.Notes,
                Date = DateTime.Parse(procedure.Date),
                HealthRecordId = healthRecordId,
                HealthRecord = healthRecord,
                AttendingDoctor = doctor
            });
        }

        try {
            await db.SaveChangesAsync();
        } catch (Exception ex) {
            return new FakeResult {
                Success = false,
                Message = $"Error saving procedures to the database: {ex.Message}"
            };
        }

        return new FakeResult {
            Success = true,
            Message = $"{count} fake procedures created successfully."
        };
    }

    public class FakeResult
    {
        public bool Success { get; init; }
        public string? Message { get; init; }
    }
}
using HealthRecords.Server.Models.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Database;

public class HealthRecordsDbContext(DbContextOptions<HealthRecordsDbContext> options)
    : IdentityDbContext<IdentityUser>(options) {
    public DbSet<Allergy> Allergies { get; set; }
    public DbSet<EmergencyContact> EmergencyContacts { get; set; }
    public DbSet<FileBlob> FileBlobs { get; set; }
    public DbSet<GeneralPractitioner> GeneralPractitioners { get; set; }
    public DbSet<HealthRecord> HealthRecords { get; set; }
    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<Procedure> Procedures { get; set; }
    public DbSet<Staff> Staff { get; set; }

    // Setup Relationships & Conversions
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // CONVERSIONS
        // Staff.Role -> String
        modelBuilder.Entity<Staff>().Property(e => e.Role).HasConversion<string>();
        // Patient.Gender -> String
        modelBuilder.Entity<Patient>().Property(e => e.Gender).HasConversion<string>();
        // Patient.BloodType -> String
        modelBuilder.Entity<Patient>().Property(e => e.BloodType).HasConversion<string>();
        // Allergy.Severity -> String
        modelBuilder.Entity<Allergy>().Property(e => e.Severity).HasConversion<string>();
        // EmergencyContact.Relationship -> String
        modelBuilder.Entity<EmergencyContact>().Property(e => e.Relationship).HasConversion<string>();
        // Prescription.DosageUnit -> String
        modelBuilder.Entity<Prescription>().Property(e => e.DosageUnit).HasConversion<string>();
        // Prescription.FrequencyUnit -> String
        modelBuilder.Entity<Prescription>().Property(e => e.FrequencyUnit).HasConversion<string>();
        // Prescription.DurationUnit -> String
        modelBuilder.Entity<Prescription>().Property(e => e.DurationUnit).HasConversion<string>();
        // HealthRecord.Reason -> String
        modelBuilder.Entity<HealthRecord>().Property(e => e.Reason).HasConversion<string>();
        // Procedure.Category -> String
        modelBuilder.Entity<Procedure>().Property(e => e.Category).HasConversion<string>();

        //// RELATIONSHIPS
        // Staff.Hospital -> Hospital
        modelBuilder.Entity<Staff>()
            .HasOne(e => e.Hospital)
            .WithMany(e => e.Staff)
            .HasForeignKey(e => e.HospitalId)
            .HasPrincipalKey(e => e.Id)
            .OnDelete(DeleteBehavior.NoAction);
        // Staff.ProfileImage -> FileBlob
        modelBuilder.Entity<Staff>()
            .HasOne(e => e.ProfileImage)
            .WithMany(navigationName: null)
            .OnDelete(DeleteBehavior.Cascade);
        // Patient.Allergies -> Allergy
        modelBuilder.Entity<Patient>()
            .HasMany(e => e.Allergies)
            .WithMany(navigationName: null);
        // Patient.EmergencyContacts -> EmergencyContact
        modelBuilder.Entity<Patient>()
            .HasMany(e => e.EmergencyContacts)
            .WithOne(e => e.Patient)
            .HasForeignKey(e => e.PatientId)
            .HasPrincipalKey(e => e.Id)
            .OnDelete(DeleteBehavior.Cascade);
        // Patient.Prescriptions -> Prescription
        modelBuilder.Entity<Patient>()
            .HasMany(e => e.Prescriptions)
            .WithOne(e => e.Patient)
            .HasForeignKey(e => e.PatientId)
            .HasPrincipalKey(e => e.Id)
            .OnDelete(DeleteBehavior.Cascade);
        // Patient.GeneralPractitioner -> GeneralPractitioner
        modelBuilder.Entity<Patient>()
            .HasOne(e => e.GeneralPractitioner)
            .WithMany(navigationName: null)
            .OnDelete(DeleteBehavior.NoAction);
        // Patient.HealthRecords -> HealthRecord
        modelBuilder.Entity<Patient>()
            .HasMany(e => e.HealthRecords)
            .WithOne(e => e.Patient)
            .HasForeignKey(e => e.PatientId)
            .HasPrincipalKey(e => e.Id)
            .OnDelete(DeleteBehavior.Cascade);
        // HealthRecord.AttendingDoctor -> Staff
        modelBuilder.Entity<HealthRecord>()
            .HasOne(e => e.AttendingDoctor)
            .WithMany(navigationName: null)
            .OnDelete(DeleteBehavior.NoAction);
        // HealthRecord.Procedures -> Procedure
        modelBuilder.Entity<HealthRecord>()
            .HasMany(e => e.Procedures)
            .WithOne(e => e.HealthRecord)
            .HasForeignKey(e => e.HealthRecordId)
            .HasPrincipalKey(e => e.Id)
            .OnDelete(DeleteBehavior.Cascade);
        // HealthRecord.Files -> FileBlob
        modelBuilder.Entity<HealthRecord>()
            .HasMany(e => e.Files)
            .WithMany(navigationName: null);
        // Procedure.AttendingDoctor -> Staff
        modelBuilder.Entity<Procedure>()
            .HasOne(e => e.AttendingDoctor)
            .WithMany(navigationName: null)
            .OnDelete(DeleteBehavior.NoAction);
        // Procedure.Files -> FileBlob
        modelBuilder.Entity<Procedure>()
            .HasMany(e => e.Files)
            .WithMany(navigationName: null);
    }
}
using HealthRecords.Server.Models.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Database;

public class HealthRecordsDbContext(DbContextOptions<HealthRecordsDbContext> options)
    : IdentityDbContext<IdentityUser>(options) {
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Hospital> Hospitals { get; set; }
    public DbSet<Staff> UserDetails { get; set; }
    public DbSet<HealthRecord> HealthRecords { get; set; }
    public DbSet<Allergy> Allergies { get; set; }
    public DbSet<EmergencyContact> EmergencyContacts { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    
    // Setup Relationships & Conversions
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);
        
        // CONVERSIONS
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
        
        //// RELATIONSHIPS
        // UserDetails.Hospital -> Hospital
        modelBuilder.Entity<Staff>().HasOne(e => e.Hospital).WithMany(e => e.Staff).HasForeignKey(e => e.HospitalId).HasPrincipalKey(e => e.Id);
        // Patient.Allergies -> Allergy
        modelBuilder.Entity<Patient>().HasMany(e => e.Allergies).WithMany(navigationName: null);
        // Patient.EmergencyContacts -> EmergencyContact
        modelBuilder.Entity<Patient>().HasMany(e => e.EmergencyContacts).WithOne(e => e.Patient).HasForeignKey(e => e.PatientId).HasPrincipalKey(e => e.Id);
        // Patient.Prescriptions -> Prescription
        modelBuilder.Entity<Patient>().HasMany(e => e.Prescriptions).WithOne(e => e.Patient).HasForeignKey(e => e.PatientId).HasPrincipalKey(e => e.Id);
        // Patient.GeneralPractitioner -> GeneralPractitioner
        modelBuilder.Entity<Patient>().HasOne(e => e.GeneralPractitioner).WithMany(navigationName: null);
    }
}
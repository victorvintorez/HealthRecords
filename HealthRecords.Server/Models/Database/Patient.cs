using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Patient {
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
    public required DateTime DateOfBirth { get; set; }
    public required Gender Gender { get; set; }
    public required float Weight { get; set; }
    public required float Height { get; set; }
    public required BloodType BloodType { get; set; }
    
    // Relationships
    public GeneralPractitioner GeneralPractitioner { get; set; }
    public ICollection<Allergy> Allergies { get; set; }
    public ICollection<EmergencyContact> EmergencyContacts { get; set; }
    public ICollection<Prescription> Prescriptions { get; set; }

    public ICollection<HealthRecord> HealthRecords { get; set; }
}
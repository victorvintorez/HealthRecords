namespace HealthRecords.Server.Models.Dto;

public class PatientDto {
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
    public required string DateOfBirth { get; set; }
    public required string Gender { get; set; }
    public required string Sex { get; set; }
    public required float Weight { get; set; }
    public required float Height { get; set; }
    public required string BloodType { get; set; }
    public int? GeneralPractitionerId { get; set; }
    public ICollection<int>? AllergyIds { get; set; }
    public ICollection<int>? EmergencyContactIds { get; set; }
    public ICollection<int>? PrescriptionIds { get; set; }
    public ICollection<int>? HealthRecordIds { get; set; }
}
namespace HealthRecords.Server.Models.FromBody;

public class CreatePatientFb {
    public required string FullName { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
    public required string DateOfBirth { get; set; }
    public required string Gender { get; set; }
    public required string Sex { get; set; }
    public required float Weight { get; set; }
    public required float Height { get; set; }
    public required string BloodType { get; set; }
    public required int GeneralPractitionerId { get; set; }
}
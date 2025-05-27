namespace HealthRecords.Server.Models.FromBody;

public class UpdatePatientFb {
    public string? FullName { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Sex { get; set; }
    public float? Weight { get; set; }
    public float? Height { get; set; }
    public string? BloodType { get; set; }
    public int? GeneralPractitionerId { get; set; }
}
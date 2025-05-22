namespace HealthRecords.Server.Models.FromBody;

public class UpdateHospitalFb {
    public string? Name { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
}
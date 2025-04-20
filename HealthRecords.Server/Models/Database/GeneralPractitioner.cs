namespace HealthRecords.Server.Models.Database;

public class GeneralPractitioner {
    public required int Id { get; set; }
    public required string SurgeryName { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
}
namespace HealthRecords.Server.Models.FromBody;

public class CreateGeneralPractitionerFb {
    public string SurgeryName { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? Email { get; set; }
    public string? Website { get; set; }
}

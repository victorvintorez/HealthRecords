namespace HealthRecords.Server.Models.FromBody;

public class CreateGeneralPractitionerFb {
    public string SurgeryName { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string? Email { get; set; }
    public string? Website { get; set; }
}

public class UpdateGeneralPractitionerFb {
    public string? SurgeryName { get; set; }
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Website { get; set; }
}

namespace HealthRecords.Server.Models.FromBody;

public class CreateEmergencyContactFb {
    public required string FullName { get; set; }
    public required string Relationship { get; set; }
    public required string PhoneNumber { get; set; }
}

public class UpdateEmergencyContactFb {
    public string? FullName { get; set; }
    public string? Relationship { get; set; }
    public string? PhoneNumber { get; set; }
}

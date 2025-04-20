namespace HealthRecords.Server.Models.Database;

public class EmergencyContact {
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public required string Relationship { get; set; }
    public required string PhoneNumber { get; set; }
     
    // Relationships
    public required int PatientId { get; set; }
    public required Patient Patient { get; set; }
}
namespace HealthRecords.Server.Models.Dto;

public class EmergencyContactDto {
    public int Id { get; set; }
    public string FullName { get; set; } = null!;
    public string Relationship { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public int PatientId { get; set; }
}

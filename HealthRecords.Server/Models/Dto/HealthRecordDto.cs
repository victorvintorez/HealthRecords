namespace HealthRecords.Server.Models.Dto;

public class HealthRecordDto {
    public int Id { get; set; }
    public required string Date { get; set; }
    public required string Reason { get; set; }
    public required string Complaint { get; set; }
    public required string Notes { get; set; }
    public string? Diagnosis { get; set; }
    public required int PatientId { get; set; }
    public required int HospitalId { get; set; }
    public required int AttendingDoctorId { get; set; }
    public List<string>? FileUrls { get; set; }
}

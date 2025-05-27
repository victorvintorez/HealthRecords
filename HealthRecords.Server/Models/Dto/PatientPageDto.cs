namespace HealthRecords.Server.Models.Dto;

public class PatientPageDto {
    public required ICollection<PatientDto> Patients { get; set; }
    public required int? Cursor { get; set; }
}
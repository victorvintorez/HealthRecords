namespace HealthRecords.Server.Models.Dto;

public class ProcedureDto {
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string Notes { get; set; }
    public required string Date { get; set; }
    public required int HealthRecordId { get; set; }
    public required int AttendingDoctorId { get; set; }
}

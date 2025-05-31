namespace HealthRecords.Server.Models.Dto;

public class PrescriptionDto {
    public int Id { get; set; }
    public required string Name { get; set; }
    public required float Dosage { get; set; }
    public required string DosageUnit { get; set; }
    public required bool DosagePerKilogram { get; set; }
    public required int Frequency { get; set; }
    public required string FrequencyUnit { get; set; }
    public required int Duration { get; set; }
    public required string DurationUnit { get; set; }
    public required int PatientId { get; set; }
}

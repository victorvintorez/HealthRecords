using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Prescription {
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required float Dosage { get; set; }
    public required DosageUnit DosageUnit { get; set; }
    public required bool DosagePerKilogram { get; set; }
    public required int Frequency { get; set; }
    public required FrequencyUnit FrequencyUnit { get; set; }
    public required string Duration { get; set; }
    public required DurationUnit DurationUnit { get; set; }
    public required string Reason { get; set; }
    
    // Relationships
    public required int PatientId { get; set; }
    public required Patient Patient { get; set; }
}
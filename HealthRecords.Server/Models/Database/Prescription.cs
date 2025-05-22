using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Prescription {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string Name { get; set; }
    public required float Dosage { get; set; }
    public required DosageUnit DosageUnit { get; set; }
    public required bool DosagePerKilogram { get; set; }
    public required int Frequency { get; set; }
    public required FrequencyUnit FrequencyUnit { get; set; }
    public required int Duration { get; set; }
    public required DurationUnit DurationUnit { get; set; }
    
    // Relationships
    public required int PatientId { get; set; }
    public virtual required Patient Patient { get; set; }
}
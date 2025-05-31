using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.FromBody;

public class CreatePrescriptionFb {
    [Required]
    [StringLength(255)]
    public required string Name { get; set; }
    [Required]
    public required float Dosage { get; set; }
    [Required]
    public required string DosageUnit { get; set; }
    [Required]
    public required bool DosagePerKilogram { get; set; }
    [Required]
    public required int Frequency { get; set; }
    [Required]
    public required string FrequencyUnit { get; set; }
    [Required]
    public required int Duration { get; set; }
    [Required]
    public required string DurationUnit { get; set; }
}

public class UpdatePrescriptionFb {
    [StringLength(255)]
    public string? Name { get; set; }
    public float? Dosage { get; set; }
    public string? DosageUnit { get; set; }
    public bool? DosagePerKilogram { get; set; }
    public int? Frequency { get; set; }
    public string? FrequencyUnit { get; set; }
    public int? Duration { get; set; }
    public string? DurationUnit { get; set; }
}

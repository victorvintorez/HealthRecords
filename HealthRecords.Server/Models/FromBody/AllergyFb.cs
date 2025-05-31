using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.FromBody;

public class CreateAllergyFb {
    [Required]
    [StringLength(255)]
    public required string Name { get; set; }
    [Required]
    [StringLength(255)]
    public required string CommonName { get; set; }
    [Required]
    public required string Severity { get; set; }
}

public class UpdateAllergyFb {
    [StringLength(255)]
    public string? Name { get; set; }
    [StringLength(255)]
    public string? CommonName { get; set; }
    public string? Severity { get; set; }
}

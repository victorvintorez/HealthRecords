using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Allergy {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string Name { get; set; }
    [StringLength(255)]
    public required string CommonName { get; set; }
    public required AllergenSeverity Severity { get; set; }
}
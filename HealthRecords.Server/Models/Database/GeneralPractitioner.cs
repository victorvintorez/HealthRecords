using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.Database;

public class GeneralPractitioner {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string SurgeryName { get; set; }
    [StringLength(255)]
    public required string Address { get; set; }
    [StringLength(255)]
    public required string PhoneNumber { get; set; }
    [StringLength(255)]
    public string? Email { get; set; }
    [StringLength(255)]   
    public string? Website { get; set; }
}
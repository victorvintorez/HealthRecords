using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class EmergencyContact {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string FullName { get; set; }
    public required Relationship Relationship { get; set; }
    [StringLength(255)]
    public required string PhoneNumber { get; set; }
     
    // Relationships
    public required int PatientId { get; set; }
    public virtual required Patient Patient { get; set; }
}
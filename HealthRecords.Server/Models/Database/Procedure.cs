using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Procedure {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string Name { get; set; }
    public required ProcedureCategory Category { get; set; }
    [StringLength(255)]
    public required string Notes { get; set; }
    public required DateTime Date { get; set; }
    
    // Relationships
    public required int HealthRecordId { get; set; }
    public required HealthRecord HealthRecord { get; set; }
    public required Staff AttendingDoctor { get; set; }
    public ICollection<FileBlob>? Files { get; set; }
}
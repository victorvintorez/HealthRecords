using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class HealthRecord {
    [Key]
    [Required]   
    public int Id { get; set; }
    public required DateTime Date { get; set; }
    public required IntakeReason Reason { get; set; }
    [StringLength(255)]
    public required string Complaint { get; set; }
    [StringLength(255)]   
    public required string Notes { get; set; }
    [StringLength(255)]  
    public string? Diagnosis { get; set; }
    
    // Relationships
    public required int PatientId { get; set; }
    public virtual required Patient Patient { get; set; }
    public virtual required Staff AttendingDoctor { get; set; }
    public virtual ICollection<Procedure> Procedures { get; } = new List<Procedure>();
    public virtual ICollection<FileBlob> Files { get; } = new List<FileBlob>();
}
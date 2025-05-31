using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.FromBody;

public class CreateHealthRecordFb {
    [Required]
    public required string Date { get; set; }
    [Required]
    public required string Reason { get; set; }
    [Required]
    [StringLength(255)]
    public required string Complaint { get; set; }
    [Required]
    [StringLength(255)]
    public required string Notes { get; set; }
    [StringLength(255)]
    public string? Diagnosis { get; set; }
    [Required]
    public required int HospitalId { get; set; }
    [Required]
    public required int AttendingDoctorId { get; set; }
    public IFormFileCollection? Files { get; set; }
}

public class UpdateHealthRecordFb {
    public string? Date { get; set; }
    public string? Reason { get; set; }
    [StringLength(255)]
    public string? Complaint { get; set; }
    [StringLength(255)]
    public string? Notes { get; set; }
    [StringLength(255)]
    public string? Diagnosis { get; set; }
    public int? HospitalId { get; set; }
    public int? AttendingDoctorId { get; set; }
    public IFormFileCollection? Files { get; set; }
}

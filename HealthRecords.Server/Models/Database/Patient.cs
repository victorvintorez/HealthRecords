using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Patient {
    [Key]
    [Required] 
    public int Id { get; set; }
    [StringLength(255)]
    public required string FullName { get; set; }
    [StringLength(255)]
    public required string Address { get; set; }
    [StringLength(255)]
    public required string PhoneNumber { get; set; }
    public required DateTime DateOfBirth { get; set; }
    public required Gender Gender { get; set; }
    public required float Weight { get; set; }
    public required float Height { get; set; }
    public required BloodType BloodType { get; set; }
    
    // Relationships
    public virtual required GeneralPractitioner GeneralPractitioner { get; set; }
    public virtual ICollection<Allergy> Allergies { get; } = new List<Allergy>();
    public virtual ICollection<EmergencyContact> EmergencyContacts { get; } = new List<EmergencyContact>();
    public virtual ICollection<Prescription> Prescriptions { get; } = new List<Prescription>();
    public virtual ICollection<HealthRecord> HealthRecords { get; } = new List<HealthRecord>();
}
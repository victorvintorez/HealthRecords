using System.ComponentModel.DataAnnotations;
using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Staff {
    [Key]
    [Required]
    public int Id { get; set; } 
    [StringLength(255)]
    public required string AccountId { get; set; } // The Identity User ID
    [StringLength(255)]
    public required string FullName { get; set; }
    [StringLength(255)]
    public required string Department { get; set; }
    public required StaffRole Role { get; set; } // The Role the user has in the hospital (Doctor, Nurse, etc.)
    
    // Relationships
    public required int HospitalId { get; set; } // The Hospital the user works at
    public required Hospital Hospital { get; set; } // The Hospital the user works at
    public required FileBlob ProfileImage { get; set; } // The user's profile image
}
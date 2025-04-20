namespace HealthRecords.Server.Models.Database;

public class Staff {
    public required string Id { get; set; } // The Identity User Id
    public required string FullName { get; set; }
    public required string Department { get; set; }
    public required string Role { get; set; } // The Role the user has in the hospital (Doctor, Nurse, etc.)
    public required string ProfileImageUrl { get; set; } // The URL of the user's profile image (stored in Azure Blob Storage)
    
    // Relationships
    public required int HospitalId { get; set; } // The Hospital the user works at
    public required Hospital Hospital { get; set; } // The Hospital the user works at
}
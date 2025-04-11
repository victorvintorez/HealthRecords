using Microsoft.AspNetCore.Identity;

namespace HealthRecords.Server.Models.Authentication;

public class HealthRecordsUser : IdentityUser {
    [PersonalData] public string FullName { get; set; } = string.Empty;
    [PersonalData] public string? HospitalId { get; set; } = string.Empty;
    [PersonalData] public string? Department { get; set; } = string.Empty;
    [PersonalData] public string? ProfileImageUrl { get; set; } = string.Empty;
}
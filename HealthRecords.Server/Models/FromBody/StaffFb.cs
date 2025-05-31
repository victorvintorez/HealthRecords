namespace HealthRecords.Server.Models.FromBody;

public class CreateStaffFb {
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FullName { get; set; }
    public required string Department { get; set; }
    public required int HospitalId { get; set; }
    public required IFormFile ProfileImage { get; set; }
}

public class UpdateStaffFb {
    public string? FullName { get; set; }
    public string? Department { get; set; }
    public string? Role { get; set; }
    public int? HospitalId { get; set; }
    public IFormFile? ProfileImage { get; set; }
}

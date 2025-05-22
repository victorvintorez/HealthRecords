namespace HealthRecords.Server.Models.FromBody;

public class CreateStaffFb {
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string FullName { get; set; }
    public required string Department { get; set; }
    public required int HospitalId { get; set; }
    public required IFormFile ProfileImage { get; set; }
}
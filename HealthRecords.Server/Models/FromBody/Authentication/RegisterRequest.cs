namespace HealthRecords.Server.Models.FromBody.Authentication;

public class RegisterRequest {
    public required string FullName { get; set; }
    public required string? HospitalId { get; set; }
    public required string? Department { get; set; }
    public required IFormFile? ProfileImageFile { get; set; }
    public required string Email { get; set; }
    public required string Password { get; set; }
    public required string ConfirmPassword { get; set; }
}
namespace HealthRecords.Server.Models.FromBody;

public class LoginFb {
    public required string Email { get; set; }
    public required string Password { get; set; }
}
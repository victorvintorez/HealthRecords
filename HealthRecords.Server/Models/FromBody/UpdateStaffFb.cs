namespace HealthRecords.Server.Models.FromBody;

public class UpdateStaffFb {
    public string? FullName { get; set; }
    public string? Department { get; set; }
    public string? Role { get; set; }
    public int? HospitalId { get; set; }
    public IFormFile? ProfileImage { get; set; }
}
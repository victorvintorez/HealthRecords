namespace HealthRecords.Server.Models.Dto;

public class StaffDto {
    public required int Id { get; set; }
    public required string FullName { get; set; }
    public required string Department { get; set; }
    public required string Role { get; set; }
    public required int HospitalId { get; set; }
    public required string HospitalName { get; set; }
    public required string ProfileImageUrl { get; set; }
}

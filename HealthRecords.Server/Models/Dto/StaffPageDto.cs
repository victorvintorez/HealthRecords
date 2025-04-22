namespace HealthRecords.Server.Models.Dto;

public class StaffPageDto {
    public required ICollection<StaffDto> Staff { get; set; }
    public required int? Cursor { get; set; }
}
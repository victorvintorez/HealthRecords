namespace HealthRecords.Server.Models.Dto;

public class HospitalDto {
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
}
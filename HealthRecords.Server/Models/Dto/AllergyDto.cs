namespace HealthRecords.Server.Models.Dto;

public class AllergyDto {
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string CommonName { get; set; }
    public required string Severity { get; set; }
}

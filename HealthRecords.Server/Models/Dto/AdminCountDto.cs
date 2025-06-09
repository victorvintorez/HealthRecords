namespace HealthRecords.Server.Models.Dto;

public class AdminCountDto {
    public required string TableName { get; set; }
    public required int RowCount { get; set; }
    public required bool GenerateFromAdminPanel { get; set; }
}

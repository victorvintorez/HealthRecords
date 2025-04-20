using HealthRecords.Server.Models.Enum;

namespace HealthRecords.Server.Models.Database;

public class Allergy {
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string CommonName { get; set; }
    public required AllergenSeverity Severity { get; set; }
}
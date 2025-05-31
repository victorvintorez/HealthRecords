namespace HealthRecords.Server.Models.FromBody;

public class CreateProcedureFb {
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string Notes { get; set; }
    public required string Date { get; set; }
    public required int AttendingDoctorId { get; set; }
}

public class UpdateProcedureFb {
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string Notes { get; set; }
    public required string Date { get; set; }
    public required int AttendingDoctorId { get; set; }
}

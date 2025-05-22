namespace HealthRecords.Server.Models.FromBody;

public class CreateHospitalFb {
    public required string Name { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
}
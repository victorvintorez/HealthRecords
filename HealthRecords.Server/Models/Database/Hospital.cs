namespace HealthRecords.Server.Models.Database;

public class Hospital {
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
    public required string PhoneNumber { get; set; }
    
    // Relationships
    public ICollection<Staff> Staff { get; set; }
}
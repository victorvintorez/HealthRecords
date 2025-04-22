using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.Database;

public class Hospital {
    [Key]
    [Required]  
    public int Id { get; set; }
    [StringLength(255)]
    public required string Name { get; set; }
    [StringLength(255)] 
    public required string Address { get; set; }
    [StringLength(255)]
    public required string PhoneNumber { get; set; }
    
    // Relationships
    public ICollection<Staff> Staff { get; set; }
}
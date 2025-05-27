using System.ComponentModel.DataAnnotations;

namespace HealthRecords.Server.Models.Database;

public class FileBlob {
    [Key]
    [Required]
    public int Id { get; set; }
    [StringLength(255)]
    public required string FileName { get; set; }
    [StringLength(255)]
    public required string ContentType { get; set; }
    [StringLength(255)]
    public required string Container { get; set; }
}
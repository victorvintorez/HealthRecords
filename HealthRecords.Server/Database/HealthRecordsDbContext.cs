using HealthRecords.Server.Models.Authentication;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HealthRecords.Server.Database;

public class HealthRecordsDbContext(DbContextOptions<HealthRecordsDbContext> options)
    : IdentityDbContext<HealthRecordsUser>(options);
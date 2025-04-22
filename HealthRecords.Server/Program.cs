using HealthRecords.Server.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Azure;
using NReco.Logging.File;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add Logging
if (builder.Environment.IsDevelopment()) {
    builder.Services.AddLogging(logging => logging.AddFile(
        Path.Join("Logs", "HealthRecords_{0:yyyy-MM-dd}.log"),
        c => {
            c.FormatLogFileName = filename => string.Format(filename, DateTime.Now);
            c.MaxRollingFiles = 5;
        }));
}

// Setup Database (Required for Authentication)
builder.Services.AddDbContext<HealthRecordsDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("SqlConnection")));

// Setup Azure Blob Storage
builder.Services.AddAzureClients(clientBuilder => {
    clientBuilder.AddBlobServiceClient(builder.Configuration.GetConnectionString("BlobConnection"));
});

// Setup Authentication
builder.Services.AddAuthorizationBuilder()
                           .AddPolicy("Administrator", policy =>
        policy.RequireAssertion(c => {
            if (c.User.Identity?.Name != null && c.User.Identity.Name ==
                (builder.Configuration.GetSection("DefaultAdminAccount").Value ?? "admin@admin.net")) {
                return true;
            }

            return c.User.IsInRole("Administrator");
        }));
builder.Services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<HealthRecordsDbContext>();

// Setup Controllers
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

// Run Database Migrations
await using (AsyncServiceScope scope = app.Services.CreateAsyncScope()) {
    var db = scope.ServiceProvider.GetService<HealthRecordsDbContext>();
    if (db != null) {
        await db.Database.MigrateAsync();
    } else {
        throw new Exception("Could not perform database migrations.");
    }
}

// SPA Support
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi("/api/v1/openapi.json");
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapIdentityApi<IdentityUser>();
app.MapControllers();

app.Run();
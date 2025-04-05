using NReco.Logging.File;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add Logging
builder.Services.AddLogging(logging => logging.AddFile(
    Path.Join(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "HealthRecords", "Logs",
        "HealthRecords_{0:yyyy-MM-dd}.log"),
    c => {
        c.FormatLogFileName = filename => string.Format(filename, DateTime.Now);
        c.MaxRollingFiles = 5;
    }));

// Setup Database (Required for Authentication)

// Setup Authentication

// Setup Controllers
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

// Run Database Migrations
/*
await using (AsyncServiceScope scope = app.Services.CreateAsyncScope()) {
    var db = scope.ServiceProvider.GetService<>();
    if (db != null) {
        await db.Database.MigrateAsync();
    } else {
        throw new Exception("Could not perform database migrations.");
    }
}
*/

// SPA Support
app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi("/api/v1/openapi.json");
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
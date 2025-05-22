using System.ComponentModel.DataAnnotations;
using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Enum;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>().AddRoles<IdentityRole>().AddEntityFrameworkStores<HealthRecordsDbContext>();

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

// Create Azure Blob Storage Containers
await using (AsyncServiceScope scope = app.Services.CreateAsyncScope()) {
    var blobServiceClient = scope.ServiceProvider.GetRequiredService<BlobServiceClient>();
    
    blobServiceClient.GetBlobContainerClient("staff-profile-images").CreateIfNotExists();
}

// Setup administrator account
Console.WriteLine("Setting up administrator account!");
await using (AsyncServiceScope scope = app.Services.CreateAsyncScope()) {
    // Get Services
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var emailAddressAttribute = new EmailAddressAttribute();
    var userStore = scope.ServiceProvider.GetRequiredService<IUserStore<IdentityUser>>();
    var dbContext = scope.ServiceProvider.GetRequiredService<HealthRecordsDbContext>();
    var blobServiceClient = scope.ServiceProvider.GetRequiredService<BlobServiceClient>();
    var emailStore = (IUserEmailStore<IdentityUser>)userStore;
    
    var email = builder.Configuration.GetSection("DefaultAdminAccount").Value ?? "admin@admin.net";
    var password = builder.Configuration.GetSection("DefaultAdminPassword").Value ?? "Admin123!";
    
    // Check if the administrator account exists
    if (await userManager.FindByEmailAsync(email) == null) {
        // Create the administrator account
        if (!string.IsNullOrEmpty(email) || emailAddressAttribute.IsValid(email)) {
            var user = new IdentityUser();
            await userStore.SetUserNameAsync(user, email, CancellationToken.None);
            await emailStore.SetEmailAsync(user, email, CancellationToken.None);
            IdentityResult creationResult = await userManager.CreateAsync(user, password);
            
            if (!creationResult.Succeeded) {
                throw new Exception(creationResult.Errors.First().Description);
            }
        }
        else {
            throw new Exception("Administrator Account Email address is invalid!");
        }
    }
    
    IdentityUser? admin = await userManager.FindByEmailAsync(email);
    if (admin == null) {
        throw new Exception("Couldn't find administrator account.");
    }
    
    // Check if the administrator account is an administrator
    if (!await userManager.IsInRoleAsync(admin, "Administrator")) {
        // Add the administrator role
        await roleManager.CreateAsync(new IdentityRole("Administrator"));
        await userManager.AddToRoleAsync(admin, "Administrator");
    }
    
    // Check if "Admin Hospital" already exists
    if (await dbContext.Hospitals.FirstOrDefaultAsync(s => s.Name == "Admin") == null) {
        dbContext.Hospitals.Add(new Hospital {
            Name = "Admin",
            Address = "N/A",
            PhoneNumber = "+44 0000 000 000"
        });
        try {
            await dbContext.SaveChangesAsync();
        }
        catch (Exception) {
            throw new Exception("Couldn't create administrator hospital record.");
        }
    }
    Hospital adminHospital = await dbContext.Hospitals.FirstAsync(s => s.Name == "Admin");
    
    // Check if a staff profile exists for Administrator Account
    if (await dbContext.Staff.FirstOrDefaultAsync(s => s.AccountId == admin.Id) == null) {
        // Create the administrator profile
        var filename = $"{admin.Id}_profile-img.png";
        BlobClient blobClient = blobServiceClient
            .GetBlobContainerClient("staff-profile-images").GetBlobClient(filename);

        try {
            await blobClient.UploadAsync(File.OpenRead("Assets/admin-profile-img.png"));
        }
        catch (Exception e) {
            throw new Exception($"Couldn't upload administrator profile image to blob storage.\n{e.Message}");
        }

        dbContext.Staff.Add(new Staff {
            AccountId = admin.Id,
            FullName = "Admin",
            Department = "Administration",
            Role = StaffRole.Viewer,
            HospitalId = adminHospital.Id,
            Hospital = adminHospital,
            ProfileImage = new FileBlob {
                FileName = filename,
                ContentType = "image/png",
                Url = blobClient.Uri.ToString()
            }
        });
        
        try {
            await dbContext.SaveChangesAsync();
        }
        catch (Exception) {
            throw new Exception("Couldn't create administrator profile record.");
        }
    }
}
Console.WriteLine("Administrator account setup complete!");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) {
    app.MapOpenApi("/api/openapi.json");
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapGroup("/api/v1/auth/").MapIdentityApi<IdentityUser>();
app.MapPost("/api/v1/auth/logout", async (SignInManager<IdentityUser> signInManager, [FromBody] object obj) => {
    if (obj == null) return Results.Unauthorized();
    await signInManager.SignOutAsync();
    return Results.Ok();
}).WithOpenApi().RequireAuthorization();

app.MapControllers();

// SPA Support
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapWhen(ctx => !ctx.Request.Path.StartsWithSegments("/api"), fallback => {
    fallback.UseEndpoints(endpoint => {
        endpoint.MapFallbackToFile("index.html");
    });
});

app.Run();
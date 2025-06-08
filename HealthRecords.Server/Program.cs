using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using HealthRecords.Server.Models.Database;
using HealthRecords.Server.Models.Enum;
using HealthRecords.Server.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
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
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("SqlConnection"),
        sqlOptions => sqlOptions.EnableRetryOnFailure()
    )
);

// Setup Cache (Required for SAS Token Service)
builder.Services.AddStackExchangeRedisCache(options => {
    options.Configuration = builder.Configuration.GetConnectionString("CacheConnection");
    options.InstanceName = "HealthRecordsCache";
});

// Setup Azure Blob Storage
builder.Services.AddAzureClients(clientBuilder => {
    clientBuilder.AddBlobServiceClient(builder.Configuration.GetConnectionString("BlobConnection"));
});

// Setup SAS Token Service
builder.Services.AddScoped<SasTokenService>();

// Setup Session Token Service
builder.Services.AddSingleton<ITicketStore, SessionTokenService>();

// Setup Authentication
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();
builder.Services.AddAuthorization();
builder.Services.AddIdentityCore<IdentityUser>()
    .AddRoles<IdentityRole>()
    .AddClaimsPrincipalFactory<UserClaimsPrincipalFactory<IdentityUser, IdentityRole>>()
    .AddSignInManager<SignInManager<IdentityUser>>()
    .AddEntityFrameworkStores<HealthRecordsDbContext>();
builder.Services.AddOptions<CookieAuthenticationOptions>(CookieAuthenticationDefaults.AuthenticationScheme).Configure<ITicketStore>((opts, store) => {
    opts.SessionStore = store;
    opts.Events.OnRedirectToLogin = context => {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    opts.Events.OnRedirectToAccessDenied = context => {
        context.Response.StatusCode = 403;
        return Task.CompletedTask;
    };
    opts.Events.OnRedirectToLogout = context => {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
    opts.Events.OnRedirectToReturnUrl = context => {
        context.Response.StatusCode = 401;
        return Task.CompletedTask;
    };
});

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
    }
    else {
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

    var email = builder.Configuration.GetSection("DefaultAdminAccount").GetSection("Email").Value ?? "admin@admin.net";
    var password = builder.Configuration.GetSection("DefaultAdminAccount").GetSection("Password").Value ?? "Admin123!";

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
            await blobClient.UploadAsync(File.OpenRead(Path.Join(Directory.GetCurrentDirectory(), "Assets", "admin-profile-img.png")));
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
                Container = blobClient.BlobContainerName
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

app.MapControllers();

// SPA Support
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapWhen(ctx => !ctx.Request.Path.StartsWithSegments("/api"),
    fallback => { fallback.UseEndpoints(endpoint => { endpoint.MapFallbackToFile("index.html"); }); });

app.Run();
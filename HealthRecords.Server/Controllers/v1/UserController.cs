using Azure.Storage.Blobs;
using HealthRecords.Server.Database;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Azure;

namespace HealthRecords.Server.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class UserController(ILogger<UserController> logger, HealthRecordsDbContext db, UserManager<IdentityUser> userManager, IAzureClientFactory<BlobServiceClient> blobClient) : ControllerBase() {
    private readonly ILogger<UserController> _logger = logger;
    private readonly HealthRecordsDbContext _db = db;
    private readonly UserManager<IdentityUser> _userManager = userManager;
    private readonly IAzureClientFactory<BlobServiceClient> _blobClient = blobClient;

    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Ok>> GetUserDetails() {
        return;
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Ok>> SetUserDetails() {
        return;
    }

    [HttpDelete]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Ok>> DeleteUserDetails() {
        return;
    }

    [HttpPatch]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<Ok>> UpdateUserDetails() {
        return;
    }
}
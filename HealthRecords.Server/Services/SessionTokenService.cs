using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Caching.Distributed;

namespace HealthRecords.Server.Services;

public class SessionTokenService(IDistributedCache cache) : ITicketStore
{
    private const string CacheKeyPrefix = "SessionToken:";

    public async Task<string> StoreAsync(AuthenticationTicket ticket)
    {
        var key = CacheKeyPrefix + Guid.NewGuid().ToString("N");
        await RenewAsync(CacheKeyPrefix + Guid.NewGuid(), ticket);
        return key;
    }

    public Task RenewAsync(string key, AuthenticationTicket ticket)
    {
        return cache.SetAsync(key, TicketSerializer.Default.Serialize(ticket),
            ticket.Properties.ExpiresUtc.HasValue
                ? new DistributedCacheEntryOptions()
                .SetAbsoluteExpiration(ticket.Properties.ExpiresUtc.Value)
                : new DistributedCacheEntryOptions());
    }

    public Task<AuthenticationTicket?> RetrieveAsync(string key)
    {
        return cache.GetAsync(key).ContinueWith(task =>
        {
            var data = task.Result;
            return data == null ? null : TicketSerializer.Default.Deserialize(data);
        });
    }

    public Task RemoveAsync(string key)
    {
        return cache.RemoveAsync(key);
    }
}
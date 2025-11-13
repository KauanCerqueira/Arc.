using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Services;

/// <summary>
/// Serviço para gerenciamento de sincronizações de integrações
/// </summary>
public class IntegrationSyncService : IIntegrationSyncService
{
    private readonly AppDbContext _context;

    public IntegrationSyncService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IntegrationSync> CreateSyncAsync(Guid userId, string integrationType, string resourceType)
    {
        var sync = new IntegrationSync
        {
            UserId = userId,
            IntegrationType = integrationType,
            ResourceType = resourceType,
            Status = IntegrationSyncStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.IntegrationSyncs.Add(sync);
        await _context.SaveChangesAsync();

        return sync;
    }

    public async Task<IntegrationSync> UpdateSyncAsync(IntegrationSync sync)
    {
        sync.UpdatedAt = DateTime.UtcNow;
        _context.IntegrationSyncs.Update(sync);
        await _context.SaveChangesAsync();
        return sync;
    }

    public async Task<IntegrationSync?> GetLastSyncAsync(Guid userId, string integrationType, string resourceType)
    {
        return await _context.IntegrationSyncs
            .Where(s => s.UserId == userId
                     && s.IntegrationType == integrationType
                     && s.ResourceType == resourceType)
            .OrderByDescending(s => s.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<List<IntegrationSync>> GetUserSyncsAsync(Guid userId)
    {
        return await _context.IntegrationSyncs
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    public async Task<List<IntegrationSync>> GetPendingSyncsAsync()
    {
        return await _context.IntegrationSyncs
            .Where(s => s.Status == IntegrationSyncStatus.Pending
                     || (s.Status == IntegrationSyncStatus.Failed && s.FailureCount < 3))
            .OrderBy(s => s.NextSyncAt ?? s.CreatedAt)
            .Take(100)
            .ToListAsync();
    }
}

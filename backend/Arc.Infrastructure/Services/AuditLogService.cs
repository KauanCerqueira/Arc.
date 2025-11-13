using Arc.Application.Encryption;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Arc.Infrastructure.Services;

/// <summary>
/// Implementação do serviço de logs de auditoria criptografados
/// </summary>
public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public AuditLogService(AppDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<AuditLog> LogAsync(
        Guid? userId,
        string action,
        object? details,
        string result,
        string? entityType = null,
        string? entityId = null,
        string? category = null,
        string severity = "Info",
        string? ipAddress = null,
        string? userAgent = null)
    {
        // Criptografar detalhes se fornecidos
        string? encryptedDetails = null;
        if (details != null)
        {
            var detailsJson = JsonSerializer.Serialize(details);
            encryptedDetails = _encryptionService.Encrypt(detailsJson);
        }

        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EncryptedDetails = encryptedDetails,
            Result = result,
            EntityType = entityType,
            EntityId = entityId,
            Category = category,
            Severity = severity,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();

        return log;
    }

    public async Task<List<AuditLog>> GetByUserIdAsync(Guid userId, int limit = 100)
    {
        return await _context.AuditLogs
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<AuditLog>> GetByEntityAsync(string entityType, string entityId, int limit = 100)
    {
        return await _context.AuditLogs
            .Where(l => l.EntityType == entityType && l.EntityId == entityId)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<AuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int limit = 1000)
    {
        return await _context.AuditLogs
            .Where(l => l.CreatedAt >= startDate && l.CreatedAt <= endDate)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<List<AuditLog>> GetByCategoryAsync(string category, int limit = 100)
    {
        return await _context.AuditLogs
            .Where(l => l.Category == category)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public string? DecryptDetails(AuditLog log)
    {
        if (string.IsNullOrEmpty(log.EncryptedDetails))
            return null;

        try
        {
            return _encryptionService.Decrypt(log.EncryptedDetails);
        }
        catch
        {
            return null; // Falha na descriptografia (chave perdida ou dados corrompidos)
        }
    }
}

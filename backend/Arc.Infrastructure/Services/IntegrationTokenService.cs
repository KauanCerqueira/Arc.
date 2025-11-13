using Arc.Application.Encryption;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Services;

/// <summary>
/// Serviço para gerenciamento de tokens de integração com criptografia
/// </summary>
public class IntegrationTokenService : IIntegrationTokenService
{
    private readonly AppDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public IntegrationTokenService(
        AppDbContext context,
        IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<IntegrationToken?> GetTokenAsync(Guid userId, string integrationType)
    {
        return await _context.IntegrationTokens
            .Where(t => t.UserId == userId && t.IntegrationType == integrationType && t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<IntegrationToken> SaveTokenAsync(IntegrationToken token)
    {
        _context.IntegrationTokens.Add(token);
        await _context.SaveChangesAsync();
        return token;
    }

    public async Task<bool> UpdateTokenAsync(IntegrationToken token)
    {
        token.UpdatedAt = DateTime.UtcNow;
        _context.IntegrationTokens.Update(token);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> RevokeTokenAsync(Guid userId, string integrationType)
    {
        var tokens = await _context.IntegrationTokens
            .Where(t => t.UserId == userId && t.IntegrationType == integrationType && t.IsActive)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.IsActive = false;
            token.RevokedAt = DateTime.UtcNow;
        }

        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<List<IntegrationToken>> GetUserTokensAsync(Guid userId)
    {
        return await _context.IntegrationTokens
            .Where(t => t.UserId == userId && t.IsActive)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public Task<bool> IsTokenExpiredAsync(IntegrationToken token)
    {
        if (token.ExpiresAt == null)
            return Task.FromResult(false);

        return Task.FromResult(token.ExpiresAt.Value <= DateTime.UtcNow);
    }

    /// <summary>
    /// Criptografa access token
    /// </summary>
    public string EncryptAccessToken(string accessToken)
    {
        return _encryptionService.Encrypt(accessToken);
    }

    /// <summary>
    /// Descriptografa access token
    /// </summary>
    public string DecryptAccessToken(string encryptedAccessToken)
    {
        return _encryptionService.Decrypt(encryptedAccessToken);
    }

    /// <summary>
    /// Criptografa refresh token
    /// </summary>
    public string EncryptRefreshToken(string refreshToken)
    {
        return _encryptionService.Encrypt(refreshToken);
    }

    /// <summary>
    /// Descriptografa refresh token
    /// </summary>
    public string DecryptRefreshToken(string encryptedRefreshToken)
    {
        return _encryptionService.Decrypt(encryptedRefreshToken);
    }
}

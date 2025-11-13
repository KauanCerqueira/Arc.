using Arc.Application.Encryption;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Infrastructure.Data;
using Arc.Infrastructure.Services;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace Arc.Tests.Unit.Services;

public class IntegrationTokenServiceTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IEncryptionService> _encryptionMock;
    private readonly IntegrationTokenService _service;

    public IntegrationTokenServiceTests()
    {
        // Setup in-memory database
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _encryptionMock = new Mock<IEncryptionService>();

        // Setup encryption mocks
        _encryptionMock.Setup(x => x.Encrypt(It.IsAny<string>(), It.IsAny<string>()))
            .Returns((string input, string keyId) => $"encrypted_{input}");
        _encryptionMock.Setup(x => x.Decrypt(It.IsAny<string>()))
            .Returns((string input) => input.Replace("encrypted_", ""));

        _service = new IntegrationTokenService(_context, _encryptionMock.Object);
    }

    [Fact]
    public async Task SaveTokenAsync_ShouldSaveToken_ToDatabase()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            IntegrationType = "Google",
            EncryptedAccessToken = "encrypted_token",
            IsActive = true
        };

        // Act
        var result = await _service.SaveTokenAsync(token);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(token.Id);
        _context.IntegrationTokens.Should().Contain(token);
    }

    [Fact]
    public async Task GetTokenAsync_ShouldReturnToken_WhenExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            IntegrationType = "GitHub",
            EncryptedAccessToken = "encrypted_token",
            IsActive = true
        };
        _context.IntegrationTokens.Add(token);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.GetTokenAsync(userId, "GitHub");

        // Assert
        result.Should().NotBeNull();
        result!.UserId.Should().Be(userId);
        result.IntegrationType.Should().Be("GitHub");
    }

    [Fact]
    public async Task GetTokenAsync_ShouldReturnNull_WhenTokenDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();

        // Act
        var result = await _service.GetTokenAsync(userId, "Google");

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task RevokeTokenAsync_ShouldSetIsActiveToFalse()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            IntegrationType = "Google",
            EncryptedAccessToken = "encrypted_token",
            IsActive = true
        };
        _context.IntegrationTokens.Add(token);
        await _context.SaveChangesAsync();

        // Act
        var result = await _service.RevokeTokenAsync(userId, "Google");

        // Assert
        result.Should().BeTrue();
        var revokedToken = await _context.IntegrationTokens.FindAsync(token.Id);
        revokedToken!.IsActive.Should().BeFalse();
        revokedToken.RevokedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task EncryptAccessToken_ShouldCallEncryptionService()
    {
        // Arrange
        var plainToken = "plain_access_token";

        // Act
        var encrypted = _service.EncryptAccessToken(plainToken);

        // Assert
        encrypted.Should().Be("encrypted_plain_access_token");
        _encryptionMock.Verify(x => x.Encrypt(plainToken, null), Times.Once);
    }

    [Fact]
    public async Task DecryptAccessToken_ShouldCallEncryptionService()
    {
        // Arrange
        var encryptedToken = "encrypted_access_token";

        // Act
        var decrypted = _service.DecryptAccessToken(encryptedToken);

        // Assert
        decrypted.Should().Be("access_token");
        _encryptionMock.Verify(x => x.Decrypt(encryptedToken), Times.Once);
    }

    [Fact]
    public async Task IsTokenExpiredAsync_ShouldReturnTrue_WhenExpired()
    {
        // Arrange
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IntegrationType = "Google",
            EncryptedAccessToken = "encrypted_token",
            ExpiresAt = DateTime.UtcNow.AddHours(-1) // Expired 1 hour ago
        };

        // Act
        var isExpired = await _service.IsTokenExpiredAsync(token);

        // Assert
        isExpired.Should().BeTrue();
    }

    [Fact]
    public async Task IsTokenExpiredAsync_ShouldReturnFalse_WhenNotExpired()
    {
        // Arrange
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IntegrationType = "Google",
            EncryptedAccessToken = "encrypted_token",
            ExpiresAt = DateTime.UtcNow.AddHours(1) // Expires in 1 hour
        };

        // Act
        var isExpired = await _service.IsTokenExpiredAsync(token);

        // Assert
        isExpired.Should().BeFalse();
    }

    [Fact]
    public async Task IsTokenExpiredAsync_ShouldReturnFalse_WhenExpiresAtIsNull()
    {
        // Arrange
        var token = new IntegrationToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IntegrationType = "GitHub",
            EncryptedAccessToken = "encrypted_token",
            ExpiresAt = null // GitHub tokens don't expire
        };

        // Act
        var isExpired = await _service.IsTokenExpiredAsync(token);

        // Assert
        isExpired.Should().BeFalse();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}

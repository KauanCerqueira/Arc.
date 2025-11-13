using Arc.Application.Encryption;
using Arc.Infrastructure.Security.Encryption;
using FluentAssertions;
using Moq;
using Xunit;

namespace Arc.Tests.Unit.Encryption;

public class EncryptionServiceTests
{
    private readonly Mock<IKeyManagementService> _keyManagementMock;
    private readonly EncryptionService _encryptionService;

    public EncryptionServiceTests()
    {
        _keyManagementMock = new Mock<IKeyManagementService>();

        // Setup mock to return a valid 256-bit key
        var testKey = new byte[32]; // 256 bits
        new Random(42).NextBytes(testKey);
        _keyManagementMock.Setup(x => x.GetCurrentKey()).Returns(testKey);
        _keyManagementMock.Setup(x => x.GetCurrentKeyId()).Returns("test-key-id");
        _keyManagementMock.Setup(x => x.GetKey(It.IsAny<string>())).Returns(testKey);

        _encryptionService = new EncryptionService(_keyManagementMock.Object);
    }

    [Fact]
    public void Encrypt_ShouldReturnEncryptedString_WhenGivenPlainText()
    {
        // Arrange
        var plainText = "senha-secreta-123";

        // Act
        var encrypted = _encryptionService.Encrypt(plainText);

        // Assert
        encrypted.Should().NotBeNull();
        encrypted.Should().NotBe(plainText);
        encrypted.Should().Contain(":"); // Should contain key format separators
    }

    [Fact]
    public void Decrypt_ShouldReturnOriginalText_WhenGivenEncryptedString()
    {
        // Arrange
        var plainText = "minha-senha-super-secreta";
        var encrypted = _encryptionService.Encrypt(plainText);

        // Act
        var decrypted = _encryptionService.Decrypt(encrypted);

        // Assert
        decrypted.Should().Be(plainText);
    }

    [Theory]
    [InlineData("")]
    [InlineData("a")]
    [InlineData("teste com espaços")]
    [InlineData("teste@com#caracteres$especiais%")]
    [InlineData("emojis 🔐🔒🗝️")]
    public void EncryptDecrypt_ShouldHandleDifferentInputs(string input)
    {
        // Act
        var encrypted = _encryptionService.Encrypt(input);
        var decrypted = _encryptionService.Decrypt(encrypted);

        // Assert
        decrypted.Should().Be(input);
    }

    [Fact]
    public void Encrypt_ShouldProduceDifferentCiphertext_ForSameInput()
    {
        // Arrange
        var plainText = "mesma-senha";

        // Act
        var encrypted1 = _encryptionService.Encrypt(plainText);
        var encrypted2 = _encryptionService.Encrypt(plainText);

        // Assert
        encrypted1.Should().NotBe(encrypted2); // Nonces should be different
    }

    [Fact]
    public void Hash_ShouldProduceConsistentHash_ForSameInput()
    {
        // Arrange
        var input = "dados-para-hash";

        // Act
        var hash1 = _encryptionService.Hash(input);
        var hash2 = _encryptionService.Hash(input);

        // Assert
        hash1.Should().Be(hash2);
        hash1.Should().NotBe(input);
    }

    [Fact]
    public void VerifyHash_ShouldReturnTrue_WhenHashMatches()
    {
        // Arrange
        var input = "dados-para-verificar";
        var hash = _encryptionService.Hash(input);

        // Act
        var isValid = _encryptionService.VerifyHash(input, hash);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyHash_ShouldReturnFalse_WhenHashDoesNotMatch()
    {
        // Arrange
        var input = "dados-originais";
        var tamperedInput = "dados-modificados";
        var hash = _encryptionService.Hash(input);

        // Act
        var isValid = _encryptionService.VerifyHash(tamperedInput, hash);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void EncryptBytes_ShouldEncryptBinaryData()
    {
        // Arrange
        var plainBytes = new byte[] { 1, 2, 3, 4, 5, 6, 7, 8 };

        // Act
        var encrypted = _encryptionService.EncryptBytes(plainBytes);

        // Assert
        encrypted.Should().NotBeNull();
        encrypted.Should().NotBeEquivalentTo(plainBytes);
    }

    [Fact]
    public void DecryptBytes_ShouldReturnOriginalData()
    {
        // Arrange
        var plainBytes = new byte[] { 10, 20, 30, 40, 50 };
        var encrypted = _encryptionService.EncryptBytes(plainBytes);

        // Act
        var decrypted = _encryptionService.DecryptBytes(encrypted);

        // Assert
        decrypted.Should().BeEquivalentTo(plainBytes);
    }

    [Fact]
    public void DeriveKey_ShouldProduceConsistentKey_WithSameSalt()
    {
        // Arrange
        var password = "minha-senha-forte";
        byte[] salt = null!;

        // Act
        var (key1, generatedSalt) = _encryptionService.DeriveKey(password);
        salt = generatedSalt;
        var (key2, _) = _encryptionService.DeriveKey(password, salt);

        // Assert
        key1.Should().BeEquivalentTo(key2);
    }

    [Fact]
    public void DeriveKey_ShouldProduceDifferentKeys_WithDifferentSalts()
    {
        // Arrange
        var password = "mesma-senha";

        // Act
        var (key1, _) = _encryptionService.DeriveKey(password);
        var (key2, _) = _encryptionService.DeriveKey(password);

        // Assert
        key1.Should().NotBeEquivalentTo(key2); // Different salts = different keys
    }

    [Fact]
    public void Decrypt_ShouldThrowException_WhenGivenInvalidFormat()
    {
        // Arrange
        var invalidEncrypted = "formato-invalido";

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _encryptionService.Decrypt(invalidEncrypted));
    }

    [Fact]
    public void Encrypt_WithSpecificKeyId_ShouldUseSpecifiedKey()
    {
        // Arrange
        var plainText = "texto-para-criptografar";
        var customKeyId = "custom-key-2024";

        // Act
        var encrypted = _encryptionService.Encrypt(plainText, customKeyId);

        // Assert
        encrypted.Should().Contain(customKeyId);
        _keyManagementMock.Verify(x => x.GetKey(customKeyId), Times.Once);
    }
}

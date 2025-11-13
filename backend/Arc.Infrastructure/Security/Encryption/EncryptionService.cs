using Arc.Application.Encryption;
using System.Security.Cryptography;
using System.Text;

namespace Arc.Infrastructure.Security.Encryption;

/// <summary>
/// Implementação do serviço de criptografia usando AES-256-GCM
/// </summary>
public class EncryptionService : IEncryptionService
{
    private readonly IKeyManagementService _keyManagement;

    // Tamanhos para AES-GCM
    private const int NonceSize = 12; // 96 bits (recomendado para GCM)
    private const int TagSize = 16; // 128 bits (authentication tag)
    private const int KeySize = 32; // 256 bits

    public EncryptionService(IKeyManagementService keyManagement)
    {
        _keyManagement = keyManagement;
    }

    /// <summary>
    /// Criptografa uma string usando AES-256-GCM
    /// </summary>
    public string Encrypt(string plainText, string? keyId = null)
    {
        if (string.IsNullOrEmpty(plainText))
            throw new ArgumentNullException(nameof(plainText));

        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var key = keyId == null
            ? _keyManagement.GetCurrentKey()
            : _keyManagement.GetKey(keyId);

        var actualKeyId = keyId ?? _keyManagement.GetCurrentKeyId();

        // Gerar nonce aleatório
        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        // Gerar tag para autenticação
        var tag = new byte[TagSize];
        var cipherText = new byte[plainBytes.Length];

        // Criptografar usando AES-GCM
        using var aesGcm = new AesGcm(key, TagSize);
        aesGcm.Encrypt(nonce, plainBytes, cipherText, tag);

        // Criar metadata
        var metadata = new EncryptionMetadata
        {
            KeyId = actualKeyId,
            Nonce = Convert.ToBase64String(nonce),
            CipherText = Convert.ToBase64String(cipherText),
            AuthTag = Convert.ToBase64String(tag)
        };

        return metadata.Serialize();
    }

    /// <summary>
    /// Descriptografa uma string criptografada com AES-256-GCM
    /// </summary>
    public string Decrypt(string encryptedText)
    {
        if (string.IsNullOrEmpty(encryptedText))
            throw new ArgumentNullException(nameof(encryptedText));

        try
        {
            var metadata = EncryptionMetadata.Deserialize(encryptedText);

            var key = _keyManagement.GetKey(metadata.KeyId);
            var nonce = Convert.FromBase64String(metadata.Nonce);
            var cipherText = Convert.FromBase64String(metadata.CipherText);
            var tag = Convert.FromBase64String(metadata.AuthTag);

            var plainBytes = new byte[cipherText.Length];

            // Descriptografar usando AES-GCM
            using var aesGcm = new AesGcm(key, TagSize);
            aesGcm.Decrypt(nonce, cipherText, tag, plainBytes);

            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (CryptographicException ex)
        {
            throw new InvalidOperationException("Failed to decrypt data. The data may be corrupted or tampered with.", ex);
        }
    }

    /// <summary>
    /// Criptografa dados binários
    /// </summary>
    public byte[] EncryptBytes(byte[] data, string? keyId = null)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentNullException(nameof(data));

        var key = keyId == null
            ? _keyManagement.GetCurrentKey()
            : _keyManagement.GetKey(keyId);

        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var tag = new byte[TagSize];
        var cipherText = new byte[data.Length];

        using var aesGcm = new AesGcm(key, TagSize);
        aesGcm.Encrypt(nonce, data, cipherText, tag);

        // Combinar: nonce + cipherText + tag
        var result = new byte[NonceSize + cipherText.Length + TagSize];
        Buffer.BlockCopy(nonce, 0, result, 0, NonceSize);
        Buffer.BlockCopy(cipherText, 0, result, NonceSize, cipherText.Length);
        Buffer.BlockCopy(tag, 0, result, NonceSize + cipherText.Length, TagSize);

        return result;
    }

    /// <summary>
    /// Descriptografa dados binários
    /// </summary>
    public byte[] DecryptBytes(byte[] encryptedData)
    {
        if (encryptedData == null || encryptedData.Length < (NonceSize + TagSize))
            throw new ArgumentException("Invalid encrypted data");

        try
        {
            var key = _keyManagement.GetCurrentKey();

            // Extrair componentes
            var nonce = new byte[NonceSize];
            var tag = new byte[TagSize];
            var cipherText = new byte[encryptedData.Length - NonceSize - TagSize];

            Buffer.BlockCopy(encryptedData, 0, nonce, 0, NonceSize);
            Buffer.BlockCopy(encryptedData, NonceSize, cipherText, 0, cipherText.Length);
            Buffer.BlockCopy(encryptedData, NonceSize + cipherText.Length, tag, 0, TagSize);

            var plainBytes = new byte[cipherText.Length];

            using var aesGcm = new AesGcm(key, TagSize);
            aesGcm.Decrypt(nonce, cipherText, tag, plainBytes);

            return plainBytes;
        }
        catch (CryptographicException ex)
        {
            throw new InvalidOperationException("Failed to decrypt data.", ex);
        }
    }

    /// <summary>
    /// Gera hash seguro SHA-256
    /// </summary>
    public string Hash(string data)
    {
        if (string.IsNullOrEmpty(data))
            throw new ArgumentNullException(nameof(data));

        var bytes = Encoding.UTF8.GetBytes(data);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }

    /// <summary>
    /// Verifica se um hash corresponde aos dados
    /// </summary>
    public bool VerifyHash(string data, string hash)
    {
        if (string.IsNullOrEmpty(data) || string.IsNullOrEmpty(hash))
            return false;

        var computedHash = Hash(data);

        // Comparação constant-time para prevenir timing attacks
        return CryptographicOperations.FixedTimeEquals(
            Convert.FromBase64String(computedHash),
            Convert.FromBase64String(hash)
        );
    }

    /// <summary>
    /// Deriva uma chave a partir de uma senha usando PBKDF2
    /// </summary>
    public (byte[] Key, byte[] Salt) DeriveKey(string password, byte[]? salt = null, int iterations = 100000)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password));

        // Gerar salt se não fornecido
        if (salt == null)
        {
            salt = new byte[32]; // 256 bits
            RandomNumberGenerator.Fill(salt);
        }

        // Derivar chave usando PBKDF2 com SHA-256
        using var pbkdf2 = new Rfc2898DeriveBytes(
            password,
            salt,
            iterations,
            HashAlgorithmName.SHA256
        );

        var key = pbkdf2.GetBytes(KeySize);

        return (key, salt);
    }
}

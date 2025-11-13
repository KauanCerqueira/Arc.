namespace Arc.Application.Encryption;

/// <summary>
/// Metadados sobre dados criptografados
/// </summary>
public class EncryptionMetadata
{
    /// <summary>
    /// ID da chave usada para criptografar
    /// </summary>
    public required string KeyId { get; set; }

    /// <summary>
    /// Nonce/IV usado na criptografia
    /// </summary>
    public required string Nonce { get; set; }

    /// <summary>
    /// Tag de autenticação (para AES-GCM)
    /// </summary>
    public required string AuthTag { get; set; }

    /// <summary>
    /// Dados criptografados
    /// </summary>
    public required string CipherText { get; set; }

    /// <summary>
    /// Data da criptografia
    /// </summary>
    public DateTime EncryptedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Versão do algoritmo de criptografia
    /// </summary>
    public string Algorithm { get; set; } = "AES-256-GCM";

    /// <summary>
    /// Serializa para string no formato: {keyId}:{nonce}:{ciphertext}:{tag}
    /// </summary>
    public string Serialize()
    {
        return $"{KeyId}:{Nonce}:{CipherText}:{AuthTag}";
    }

    /// <summary>
    /// Deserializa de string no formato: {keyId}:{nonce}:{ciphertext}:{tag}
    /// </summary>
    public static EncryptionMetadata Deserialize(string serialized)
    {
        var parts = serialized.Split(':');
        if (parts.Length != 4)
        {
            throw new ArgumentException("Invalid encrypted data format");
        }

        return new EncryptionMetadata
        {
            KeyId = parts[0],
            Nonce = parts[1],
            CipherText = parts[2],
            AuthTag = parts[3]
        };
    }
}

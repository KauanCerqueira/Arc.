namespace Arc.Application.Encryption;

/// <summary>
/// Interface para serviços de criptografia usando AES-256-GCM
/// </summary>
public interface IEncryptionService
{
    /// <summary>
    /// Criptografa uma string usando AES-256-GCM
    /// </summary>
    /// <param name="plainText">Texto a ser criptografado</param>
    /// <param name="keyId">ID da chave a ser usada (opcional, usa chave atual se não especificado)</param>
    /// <returns>Texto criptografado em Base64 com formato: {keyId}:{nonce}:{ciphertext}:{tag}</returns>
    string Encrypt(string plainText, string? keyId = null);

    /// <summary>
    /// Descriptografa uma string criptografada com AES-256-GCM
    /// </summary>
    /// <param name="encryptedText">Texto criptografado em Base64</param>
    /// <returns>Texto descriptografado</returns>
    string Decrypt(string encryptedText);

    /// <summary>
    /// Criptografa dados binários
    /// </summary>
    /// <param name="data">Dados a serem criptografados</param>
    /// <param name="keyId">ID da chave a ser usada</param>
    /// <returns>Dados criptografados</returns>
    byte[] EncryptBytes(byte[] data, string? keyId = null);

    /// <summary>
    /// Descriptografa dados binários
    /// </summary>
    /// <param name="encryptedData">Dados criptografados</param>
    /// <returns>Dados descriptografados</returns>
    byte[] DecryptBytes(byte[] encryptedData);

    /// <summary>
    /// Gera hash seguro de uma string (SHA-256)
    /// </summary>
    /// <param name="data">Dados para gerar hash</param>
    /// <returns>Hash em Base64</returns>
    string Hash(string data);

    /// <summary>
    /// Verifica se um hash corresponde aos dados
    /// </summary>
    /// <param name="data">Dados originais</param>
    /// <param name="hash">Hash para verificar</param>
    /// <returns>True se o hash corresponder</returns>
    bool VerifyHash(string data, string hash);

    /// <summary>
    /// Deriva uma chave a partir de uma senha usando PBKDF2
    /// </summary>
    /// <param name="password">Senha</param>
    /// <param name="salt">Salt (será gerado se null)</param>
    /// <param name="iterations">Número de iterações (padrão: 100000)</param>
    /// <returns>Tupla com chave derivada e salt usado</returns>
    (byte[] Key, byte[] Salt) DeriveKey(string password, byte[]? salt = null, int iterations = 100000);
}

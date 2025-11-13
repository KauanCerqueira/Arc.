namespace Arc.Application.Encryption;

/// <summary>
/// Interface para gerenciamento de chaves de criptografia
/// </summary>
public interface IKeyManagementService
{
    /// <summary>
    /// Obtém a chave de criptografia atual
    /// </summary>
    /// <returns>Chave de criptografia em bytes</returns>
    byte[] GetCurrentKey();

    /// <summary>
    /// Obtém uma chave específica pelo ID
    /// </summary>
    /// <param name="keyId">ID da chave</param>
    /// <returns>Chave de criptografia em bytes</returns>
    byte[] GetKey(string keyId);

    /// <summary>
    /// Obtém o ID da chave atual
    /// </summary>
    /// <returns>ID da chave atual</returns>
    string GetCurrentKeyId();

    /// <summary>
    /// Gera uma nova chave e a marca como atual
    /// </summary>
    /// <returns>ID da nova chave gerada</returns>
    Task<string> RotateKeyAsync();

    /// <summary>
    /// Verifica se uma chave existe
    /// </summary>
    /// <param name="keyId">ID da chave</param>
    /// <returns>True se a chave existir</returns>
    bool KeyExists(string keyId);

    /// <summary>
    /// Lista todas as chaves disponíveis
    /// </summary>
    /// <returns>Lista de IDs de chaves</returns>
    IEnumerable<string> GetAllKeyIds();

    /// <summary>
    /// Remove chaves antigas (mantém as últimas N chaves)
    /// </summary>
    /// <param name="keepCount">Número de chaves a manter (padrão: 3)</param>
    /// <returns>Número de chaves removidas</returns>
    Task<int> PruneOldKeysAsync(int keepCount = 3);

    /// <summary>
    /// Verifica se é necessário rotacionar a chave (baseado em data/uso)
    /// </summary>
    /// <returns>True se a rotação é recomendada</returns>
    Task<bool> ShouldRotateKeyAsync();
}

namespace Arc.Application.Encryption;

/// <summary>
/// Interface para assinatura HMAC (Hash-based Message Authentication Code)
/// </summary>
public interface IHmacService
{
    /// <summary>
    /// Gera assinatura HMAC-SHA256 para os dados
    /// </summary>
    /// <param name="data">Dados a serem assinados</param>
    /// <returns>Assinatura HMAC em Base64</returns>
    string Sign(string data);

    /// <summary>
    /// Verifica se a assinatura HMAC é válida
    /// </summary>
    /// <param name="data">Dados originais</param>
    /// <param name="signature">Assinatura para verificar</param>
    /// <returns>True se a assinatura for válida</returns>
    bool Verify(string data, string signature);

    /// <summary>
    /// Gera assinatura HMAC para dados binários
    /// </summary>
    /// <param name="data">Dados binários</param>
    /// <returns>Assinatura HMAC</returns>
    byte[] SignBytes(byte[] data);

    /// <summary>
    /// Verifica assinatura HMAC para dados binários
    /// </summary>
    /// <param name="data">Dados originais</param>
    /// <param name="signature">Assinatura para verificar</param>
    /// <returns>True se a assinatura for válida</returns>
    bool VerifyBytes(byte[] data, byte[] signature);
}

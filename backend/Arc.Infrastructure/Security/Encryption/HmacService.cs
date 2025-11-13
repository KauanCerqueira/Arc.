using Arc.Application.Encryption;
using System.Security.Cryptography;
using System.Text;

namespace Arc.Infrastructure.Security.Encryption;

/// <summary>
/// Implementação do serviço de assinatura HMAC-SHA256
/// </summary>
public class HmacService : IHmacService
{
    private readonly IKeyManagementService _keyManagement;

    public HmacService(IKeyManagementService keyManagement)
    {
        _keyManagement = keyManagement;
    }

    /// <summary>
    /// Gera assinatura HMAC-SHA256 para os dados
    /// </summary>
    public string Sign(string data)
    {
        if (string.IsNullOrEmpty(data))
            throw new ArgumentNullException(nameof(data));

        var dataBytes = Encoding.UTF8.GetBytes(data);
        var signatureBytes = SignBytes(dataBytes);

        return Convert.ToBase64String(signatureBytes);
    }

    /// <summary>
    /// Verifica se a assinatura HMAC é válida
    /// </summary>
    public bool Verify(string data, string signature)
    {
        if (string.IsNullOrEmpty(data) || string.IsNullOrEmpty(signature))
            return false;

        try
        {
            var dataBytes = Encoding.UTF8.GetBytes(data);
            var signatureBytes = Convert.FromBase64String(signature);

            return VerifyBytes(dataBytes, signatureBytes);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Gera assinatura HMAC para dados binários
    /// </summary>
    public byte[] SignBytes(byte[] data)
    {
        if (data == null || data.Length == 0)
            throw new ArgumentNullException(nameof(data));

        var key = _keyManagement.GetCurrentKey();

        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(data);
    }

    /// <summary>
    /// Verifica assinatura HMAC para dados binários
    /// </summary>
    public bool VerifyBytes(byte[] data, byte[] signature)
    {
        if (data == null || signature == null)
            return false;

        try
        {
            var computedSignature = SignBytes(data);

            // Comparação constant-time para prevenir timing attacks
            return CryptographicOperations.FixedTimeEquals(computedSignature, signature);
        }
        catch
        {
            return false;
        }
    }
}

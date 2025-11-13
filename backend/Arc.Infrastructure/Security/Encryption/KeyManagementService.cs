using Arc.Application.Encryption;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Arc.Infrastructure.Security.Encryption;

/// <summary>
/// Implementação do serviço de gerenciamento de chaves
/// Suporta rotação automática e múltiplas chaves para descriptografia de dados antigos
/// </summary>
public class KeyManagementService : IKeyManagementService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<KeyManagementService> _logger;
    private readonly KeyRotationPolicy _policy;

    // Cache de chaves em memória (em produção, usar KeyVault/KMS)
    private readonly ConcurrentDictionary<string, KeyInfo> _keys = new();
    private string _currentKeyId;
    private readonly object _rotationLock = new();

    private const int KeySize = 32; // 256 bits para AES-256

    public KeyManagementService(
        IConfiguration configuration,
        ILogger<KeyManagementService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _policy = new KeyRotationPolicy();

        // Configurar política de rotação
        ConfigureRotationPolicy();

        // Inicializar com chave atual ou criar uma nova
        InitializeKeys();
    }

    private void ConfigureRotationPolicy()
    {
        var policyConfig = _configuration.GetSection("Encryption:KeyRotation");

        if (policyConfig.Exists())
        {
            _policy.RotationIntervalDays = policyConfig.GetValue<int>("IntervalDays", 90);
            _policy.MaxOperationsBeforeRotation = policyConfig.GetValue<long>("MaxOperations", 1_000_000);
            _policy.KeepOldKeysCount = policyConfig.GetValue<int>("KeepOldKeys", 3);
            _policy.AutoRotationEnabled = policyConfig.GetValue<bool>("AutoRotation", true);
        }
    }

    private void InitializeKeys()
    {
        // Tentar carregar chave mestra do configuration
        var masterKey = _configuration["Encryption:MasterKey"];

        if (!string.IsNullOrEmpty(masterKey))
        {
            try
            {
                var keyBytes = Convert.FromBase64String(masterKey);
                if (keyBytes.Length == KeySize)
                {
                    var keyId = "master-001";
                    _keys[keyId] = new KeyInfo
                    {
                        Id = keyId,
                        Key = keyBytes,
                        CreatedAt = DateTime.UtcNow,
                        OperationCount = 0
                    };
                    _currentKeyId = keyId;
                    _logger.LogInformation("Loaded master encryption key");
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to load master key from configuration");
            }
        }

        // Se não houver chave, gerar uma nova
        _logger.LogWarning("No master key found in configuration. Generating new key...");
        var newKeyId = GenerateKeyId();
        var newKey = GenerateKey();

        _keys[newKeyId] = new KeyInfo
        {
            Id = newKeyId,
            Key = newKey,
            CreatedAt = DateTime.UtcNow,
            OperationCount = 0
        };
        _currentKeyId = newKeyId;

        _logger.LogInformation("Generated new encryption key: {KeyId}", newKeyId);
        _logger.LogWarning("IMPORTANT: Store this key securely. Base64: {Key}",
            Convert.ToBase64String(newKey));
    }

    public byte[] GetCurrentKey()
    {
        var keyInfo = _keys[_currentKeyId];
        keyInfo.OperationCount++;
        keyInfo.LastUsedAt = DateTime.UtcNow;
        return keyInfo.Key;
    }

    public byte[] GetKey(string keyId)
    {
        if (!_keys.TryGetValue(keyId, out var keyInfo))
        {
            throw new InvalidOperationException($"Encryption key '{keyId}' not found");
        }

        keyInfo.OperationCount++;
        keyInfo.LastUsedAt = DateTime.UtcNow;
        return keyInfo.Key;
    }

    public string GetCurrentKeyId()
    {
        return _currentKeyId;
    }

    public Task<string> RotateKeyAsync()
    {
        return Task.Run(() =>
        {
            lock (_rotationLock)
            {
                _logger.LogInformation("Starting key rotation...");

                var newKeyId = GenerateKeyId();
                var newKey = GenerateKey();

                _keys[newKeyId] = new KeyInfo
                {
                    Id = newKeyId,
                    Key = newKey,
                    CreatedAt = DateTime.UtcNow,
                    OperationCount = 0
                };

                var oldKeyId = _currentKeyId;
                _currentKeyId = newKeyId;

                _logger.LogInformation("Key rotated from {OldKeyId} to {NewKeyId}", oldKeyId, newKeyId);
                _logger.LogWarning("IMPORTANT: New key Base64: {Key}", Convert.ToBase64String(newKey));

                return newKeyId;
            }
        });
    }

    public bool KeyExists(string keyId)
    {
        return _keys.ContainsKey(keyId);
    }

    public IEnumerable<string> GetAllKeyIds()
    {
        return _keys.Keys.OrderByDescending(k => _keys[k].CreatedAt);
    }

    public Task<int> PruneOldKeysAsync(int keepCount = 3)
    {
        return Task.Run(() =>
        {
            var sortedKeys = _keys
                .OrderByDescending(k => k.Value.CreatedAt)
                .ToList();

            var keysToRemove = sortedKeys
                .Skip(keepCount)
                .Where(k => k.Key != _currentKeyId) // Nunca remover chave atual
                .ToList();

            var removedCount = 0;

            foreach (var keyPair in keysToRemove)
            {
                if (_keys.TryRemove(keyPair.Key, out _))
                {
                    removedCount++;
                    _logger.LogInformation("Pruned old encryption key: {KeyId}", keyPair.Key);
                }
            }

            return removedCount;
        });
    }

    public Task<bool> ShouldRotateKeyAsync()
    {
        return Task.Run(() =>
        {
            if (!_policy.AutoRotationEnabled)
                return false;

            var currentKey = _keys[_currentKeyId];

            // Verificar idade da chave
            var keyAge = DateTime.UtcNow - currentKey.CreatedAt;
            if (keyAge.TotalDays >= _policy.RotationIntervalDays)
            {
                _logger.LogInformation("Key rotation recommended: Key age {Days} days exceeds policy {MaxDays} days",
                    keyAge.TotalDays, _policy.RotationIntervalDays);
                return true;
            }

            // Verificar número de operações
            if (currentKey.OperationCount >= _policy.MaxOperationsBeforeRotation)
            {
                _logger.LogInformation("Key rotation recommended: Operation count {Count} exceeds policy {MaxCount}",
                    currentKey.OperationCount, _policy.MaxOperationsBeforeRotation);
                return true;
            }

            return false;
        });
    }

    private static byte[] GenerateKey()
    {
        var key = new byte[KeySize];
        RandomNumberGenerator.Fill(key);
        return key;
    }

    private static string GenerateKeyId()
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var random = Convert.ToBase64String(RandomNumberGenerator.GetBytes(4))
            .Replace("+", "").Replace("/", "").Replace("=", "");
        return $"key-{timestamp}-{random}";
    }

    private class KeyInfo
    {
        public required string Id { get; set; }
        public required byte[] Key { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public long OperationCount { get; set; }
    }
}

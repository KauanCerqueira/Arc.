namespace Arc.Application.Encryption;

/// <summary>
/// Política de rotação de chaves
/// </summary>
public class KeyRotationPolicy
{
    /// <summary>
    /// Intervalo de rotação automática (em dias)
    /// </summary>
    public int RotationIntervalDays { get; set; } = 90; // 3 meses

    /// <summary>
    /// Número máximo de operações antes de rotacionar
    /// </summary>
    public long MaxOperationsBeforeRotation { get; set; } = 1_000_000;

    /// <summary>
    /// Número de chaves antigas a manter
    /// </summary>
    public int KeepOldKeysCount { get; set; } = 3;

    /// <summary>
    /// Ativar rotação automática
    /// </summary>
    public bool AutoRotationEnabled { get; set; } = true;

    /// <summary>
    /// Horário para executar rotação automática (UTC)
    /// </summary>
    public TimeSpan RotationTime { get; set; } = new TimeSpan(3, 0, 0); // 3 AM UTC
}

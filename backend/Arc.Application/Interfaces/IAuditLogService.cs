using Arc.Domain.Entities;

namespace Arc.Application.Interfaces;

/// <summary>
/// Interface para serviço de logs de auditoria criptografados
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Cria um log de auditoria com detalhes criptografados
    /// </summary>
    /// <param name="userId">ID do usuário que executou a ação</param>
    /// <param name="action">Tipo de ação</param>
    /// <param name="details">Detalhes da ação (serão criptografados)</param>
    /// <param name="result">Resultado da ação</param>
    /// <param name="entityType">Tipo de entidade afetada (opcional)</param>
    /// <param name="entityId">ID da entidade afetada (opcional)</param>
    /// <param name="category">Categoria do log (opcional)</param>
    /// <param name="severity">Severidade do log (padrão: Info)</param>
    /// <param name="ipAddress">IP do usuário (opcional)</param>
    /// <param name="userAgent">User Agent (opcional)</param>
    /// <returns>Log de auditoria criado</returns>
    Task<AuditLog> LogAsync(
        Guid? userId,
        string action,
        object? details,
        string result,
        string? entityType = null,
        string? entityId = null,
        string? category = null,
        string severity = "Info",
        string? ipAddress = null,
        string? userAgent = null);

    /// <summary>
    /// Busca logs de auditoria por usuário
    /// </summary>
    Task<List<AuditLog>> GetByUserIdAsync(Guid userId, int limit = 100);

    /// <summary>
    /// Busca logs de auditoria por entidade
    /// </summary>
    Task<List<AuditLog>> GetByEntityAsync(string entityType, string entityId, int limit = 100);

    /// <summary>
    /// Busca logs de auditoria por período
    /// </summary>
    Task<List<AuditLog>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, int limit = 1000);

    /// <summary>
    /// Busca logs de auditoria por categoria
    /// </summary>
    Task<List<AuditLog>> GetByCategoryAsync(string category, int limit = 100);

    /// <summary>
    /// Descriptografa os detalhes de um log de auditoria
    /// </summary>
    string? DecryptDetails(AuditLog log);
}

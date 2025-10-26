using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Workspace;

// ============================================
// REQUEST DTOs
// ============================================

public class CreateWorkspaceRequestDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;
}

public class UpdateWorkspaceRequestDto
{
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 100 caracteres")]
    public string? Nome { get; set; }

    public string? Theme { get; set; }
    public string? Language { get; set; }
    public string? Timezone { get; set; }
    public string? DateFormat { get; set; }
}

public class UpdateWorkspaceSettingsRequestDto
{
    public string? Theme { get; set; }
    public string? Language { get; set; }
    public string? Timezone { get; set; }
    public string? DateFormat { get; set; }
}

// ============================================
// RESPONSE DTOs
// ============================================

public class WorkspaceDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public WorkspaceSettingsDto Settings { get; set; } = new();
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

public class WorkspaceWithGroupsDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public WorkspaceSettingsDto Settings { get; set; } = new();
    public List<GroupDto> Groups { get; set; } = new();
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

public class WorkspaceSettingsDto
{
    public string Theme { get; set; } = "light";
    public string Language { get; set; } = "pt-BR";
    public string Timezone { get; set; } = "America/Sao_Paulo";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
}

// ============================================
// AUXILIARY DTOs
// ============================================

public class GroupDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Icone { get; set; } = "📁";
    public string Cor { get; set; } = "gray";
    public bool Expandido { get; set; }
    public bool Favorito { get; set; }
    public bool Arquivado { get; set; }
    public int Posicao { get; set; }
    public List<PageDto> Pages { get; set; } = new();
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

public class PageDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Template { get; set; } = "blank";
    public string? Icone { get; set; }
    public object Data { get; set; } = new { };
    public bool Favorito { get; set; }
    public int Posicao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

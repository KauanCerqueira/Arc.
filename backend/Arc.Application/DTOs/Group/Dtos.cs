using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Group;

// ============================================
// REQUEST DTOs
// ============================================

public class CreateGroupRequestDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Nome deve ter entre 1 e 100 caracteres")]
    public string Nome { get; set; } = string.Empty;

    public string? Descricao { get; set; }
    public string Icone { get; set; } = "📁";
    public string Cor { get; set; } = "gray";
}

public class CreateGroupFromPresetRequestDto
{
    [Required(ErrorMessage = "PresetId é obrigatório")]
    public string PresetId { get; set; } = string.Empty;

    public string? Nome { get; set; }
}

public class UpdateGroupRequestDto
{
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Nome deve ter entre 1 e 100 caracteres")]
    public string? Nome { get; set; }

    public string? Descricao { get; set; }
    public string? Icone { get; set; }
    public string? Cor { get; set; }
}

public class ToggleGroupExpandedRequestDto
{
    public bool Expandido { get; set; }
}

public class ToggleGroupFavoriteRequestDto
{
    public bool Favorito { get; set; }
}

public class ReorderGroupsRequestDto
{
    [Required]
    public List<Guid> GroupIds { get; set; } = new();
}

// ============================================
// RESPONSE DTOs
// ============================================

public class GroupDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Icone { get; set; } = "📁";
    public string Cor { get; set; } = "gray";
    public bool Expandido { get; set; }
    public bool Favorito { get; set; }
    public bool Arquivado { get; set; }
    public int Posicao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

public class GroupWithPagesDto
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
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

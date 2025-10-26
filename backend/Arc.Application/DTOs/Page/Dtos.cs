using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Page;

// ============================================
// REQUEST DTOs
// ============================================

public class CreatePageRequestDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Nome deve ter entre 1 e 200 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Template é obrigatório")]
    public string Template { get; set; } = "blank";

    public string? Icone { get; set; }
}

public class UpdatePageRequestDto
{
    [StringLength(200, MinimumLength = 1, ErrorMessage = "Nome deve ter entre 1 e 200 caracteres")]
    public string? Nome { get; set; }

    public string? Icone { get; set; }
}

public class UpdatePageDataRequestDto
{
    [Required(ErrorMessage = "Data é obrigatório")]
    public object Data { get; set; } = new { };
}

public class TogglePageFavoriteRequestDto
{
    public bool Favorito { get; set; }
}

public class MovePageRequestDto
{
    [Required(ErrorMessage = "NovoGroupId é obrigatório")]
    public Guid NovoGroupId { get; set; }
}

public class ReorderPagesRequestDto
{
    [Required]
    public List<Guid> PageIds { get; set; } = new();
}

// ============================================
// RESPONSE DTOs
// ============================================

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

public class PageWithGroupDto
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupNome { get; set; } = string.Empty;
    public string GroupIcone { get; set; } = "📁";
    public string Nome { get; set; } = string.Empty;
    public string Template { get; set; } = "blank";
    public string? Icone { get; set; }
    public object Data { get; set; } = new { };
    public bool Favorito { get; set; }
    public int Posicao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

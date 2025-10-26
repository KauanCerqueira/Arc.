namespace Arc.Domain.Entities;

public class Group
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public string Icone { get; set; } = "📁";
    public string Cor { get; set; } = "gray";
    public bool Expandido { get; set; } = true;
    public bool Favorito { get; set; } = false;
    public bool Arquivado { get; set; } = false;
    public int Posicao { get; set; } = 0;
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    // Navigation properties
    public Workspace? Workspace { get; set; }
    public ICollection<Page> Pages { get; set; } = new List<Page>();

    public Group()
    {
        Id = Guid.NewGuid();
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }
}

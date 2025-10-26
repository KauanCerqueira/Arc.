namespace Arc.Domain.Entities;

public class Page
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Template { get; set; } = "blank";
    public string? Icone { get; set; }
    public string Data { get; set; } = "{}"; // JSON string
    public bool Favorito { get; set; } = false;
    public int Posicao { get; set; } = 0;
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }

    // Navigation properties
    public Group? Group { get; set; }

    public Page()
    {
        Id = Guid.NewGuid();
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
    }
}

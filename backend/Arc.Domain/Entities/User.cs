namespace Arc.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Icone { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
    public bool Ativo { get; set; }

    public User()
    {
        Id = Guid.NewGuid();
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
        Ativo = true;
    }
}

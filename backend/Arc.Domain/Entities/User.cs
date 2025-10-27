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
    public string? Profissao { get; set; }
    public string? ComoConheceu { get; set; } // Como conheceu a ferramenta
    public bool IsMaster { get; set; } // Flag para usuário master/admin
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
    public bool Ativo { get; set; }

    public User()
    {
        Id = Guid.NewGuid();
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
        Ativo = true;
        IsMaster = false;
    }
}

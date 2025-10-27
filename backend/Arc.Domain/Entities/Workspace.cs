using Arc.Domain.Enums;

namespace Arc.Domain.Entities;

public class Workspace
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string Theme { get; set; } = "light";
    public string Language { get; set; } = "pt-BR";
    public string Timezone { get; set; } = "America/Sao_Paulo";
    public string DateFormat { get; set; } = "DD/MM/YYYY";
    public WorkspaceType Type { get; set; }
    public int MaxMembers { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime AtualizadoEm { get; set; }
    public bool Ativo { get; set; }

    // Navigation properties
    public User? User { get; set; }
    public ICollection<Group> Groups { get; set; } = new List<Group>();
    public ICollection<WorkspaceMember> Members { get; set; } = new List<WorkspaceMember>();
    public ICollection<WorkspaceInvitation> Invitations { get; set; } = new List<WorkspaceInvitation>();

    public Workspace()
    {
        Id = Guid.NewGuid();
        CriadoEm = DateTime.UtcNow;
        AtualizadoEm = DateTime.UtcNow;
        Ativo = true;
        Type = WorkspaceType.Individual;
        MaxMembers = 1; // Individual por padrão
    }
}

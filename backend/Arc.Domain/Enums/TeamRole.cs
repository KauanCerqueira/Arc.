namespace Arc.Domain.Enums;

public enum TeamRole
{
    Owner = 0,    // Dono do workspace, pode gerenciar tudo
    Admin = 1,    // Pode gerenciar membros e permissões
    Member = 2    // Membro regular, acesso baseado em permissões
}

using System;
using Arc.Domain.Enums;

namespace Arc.Domain.Entities
{
    public class TeamMember
    {
        public Guid Id { get; set; }
        public Guid WorkspaceId { get; set; }
        public Workspace Workspace { get; set; } = null!;
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public TeamRole Role { get; set; }
        public string? CustomTitle { get; set; } // Título customizado (ex: "Lead Designer")

        // Permissões específicas (sobrescreve role padrão se necessário)
        public bool CanInviteMembers { get; set; }
        public bool CanRemoveMembers { get; set; }
        public bool CanManageProjects { get; set; }
        public bool CanDeleteProjects { get; set; }
        public bool CanManageIntegrations { get; set; }
        public bool CanExportData { get; set; }

        public DateTime InvitedAt { get; set; }
        public DateTime? JoinedAt { get; set; }
        public Guid? InvitedBy { get; set; }

        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Helper methods
        public bool HasPermission(string permission)
        {
            return permission switch
            {
                "invite_members" => CanInviteMembers || Role <= TeamRole.Admin,
                "remove_members" => CanRemoveMembers || Role <= TeamRole.Admin,
                "manage_projects" => CanManageProjects || Role <= TeamRole.Member,
                "delete_projects" => CanDeleteProjects || Role <= TeamRole.Admin,
                "manage_integrations" => CanManageIntegrations || Role <= TeamRole.Admin,
                "export_data" => CanExportData || Role <= TeamRole.Admin,
                _ => false
            };
        }

        public static TeamMember CreateOwner(Guid workspaceId, Guid userId)
        {
            return new TeamMember
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                UserId = userId,
                Role = TeamRole.Owner,
                CanInviteMembers = true,
                CanRemoveMembers = true,
                CanManageProjects = true,
                CanDeleteProjects = true,
                CanManageIntegrations = true,
                CanExportData = true,
                IsActive = true,
                InvitedAt = DateTime.UtcNow,
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static TeamMember CreateMember(Guid workspaceId, Guid userId, TeamRole role, string? customTitle = null)
        {
            var permissions = role switch
            {
                TeamRole.Admin => new
                {
                    CanInviteMembers = true,
                    CanRemoveMembers = true,
                    CanManageProjects = true,
                    CanDeleteProjects = true,
                    CanManageIntegrations = true,
                    CanExportData = true
                },
                TeamRole.Member => new
                {
                    CanInviteMembers = false,
                    CanRemoveMembers = false,
                    CanManageProjects = true,
                    CanDeleteProjects = false,
                    CanManageIntegrations = false,
                    CanExportData = false
                },
                _ => new
                {
                    CanInviteMembers = false,
                    CanRemoveMembers = false,
                    CanManageProjects = false,
                    CanDeleteProjects = false,
                    CanManageIntegrations = false,
                    CanExportData = false
                }
            };

            return new TeamMember
            {
                Id = Guid.NewGuid(),
                WorkspaceId = workspaceId,
                UserId = userId,
                Role = role,
                CustomTitle = customTitle,
                CanInviteMembers = permissions.CanInviteMembers,
                CanRemoveMembers = permissions.CanRemoveMembers,
                CanManageProjects = permissions.CanManageProjects,
                CanDeleteProjects = permissions.CanDeleteProjects,
                CanManageIntegrations = permissions.CanManageIntegrations,
                CanExportData = permissions.CanExportData,
                IsActive = false, // Precisa aceitar convite
                InvitedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static TeamMember CreateMember(Guid workspaceId, Guid userId, Guid invitedBy, TeamRole role = TeamRole.Member)
        {
            var member = CreateMember(workspaceId, userId, role);
            member.InvitedBy = invitedBy;
            return member;
        }
    }
}

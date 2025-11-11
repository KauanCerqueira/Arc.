using Arc.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Workspace> Workspaces { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Page> Pages { get; set; }
    public DbSet<PromoCode> PromoCodes { get; set; }
    public DbSet<WorkspaceMember> WorkspaceMembers { get; set; }
    public DbSet<WorkspaceInvitation> WorkspaceInvitations { get; set; }
    public DbSet<GroupPermission> GroupPermissions { get; set; }
    public DbSet<PagePermission> PagePermissions { get; set; }
    public DbSet<Subscription> Subscriptions { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<Sprint> Sprints { get; set; }
    public DbSet<SprintTask> SprintTasks { get; set; }
    public DbSet<UserAchievement> UserAchievements { get; set; }
    public DbSet<UserBadge> UserBadges { get; set; }
    public DbSet<UserStats> UserStats { get; set; }
    public DbSet<Budget> Budgets { get; set; }
    public DbSet<BudgetItem> BudgetItems { get; set; }
    public DbSet<BudgetPhase> BudgetPhases { get; set; }
    public DbSet<BudgetPaymentInstallment> BudgetPaymentInstallments { get; set; }

    public override int SaveChanges()
    {
        UpdateAuditFields();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditFields();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditFields()
    {
        var userEntries = ChangeTracker.Entries<User>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in userEntries)
        {
            entry.Entity.AtualizadoEm = DateTime.UtcNow;
        }

        var workspaceEntries = ChangeTracker.Entries<Workspace>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in workspaceEntries)
        {
            entry.Entity.AtualizadoEm = DateTime.UtcNow;
        }

        var groupEntries = ChangeTracker.Entries<Group>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in groupEntries)
        {
            entry.Entity.AtualizadoEm = DateTime.UtcNow;
        }

        var pageEntries = ChangeTracker.Entries<Page>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in pageEntries)
        {
            entry.Entity.AtualizadoEm = DateTime.UtcNow;
        }

        var sprintEntries = ChangeTracker.Entries<Sprint>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in sprintEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        var sprintTaskEntries = ChangeTracker.Entries<SprintTask>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in sprintTaskEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        var userAchievementEntries = ChangeTracker.Entries<UserAchievement>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in userAchievementEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        var userStatsEntries = ChangeTracker.Entries<UserStats>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in userStatsEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        var budgetEntries = ChangeTracker.Entries<Budget>()
            .Where(e => e.State == EntityState.Modified);
        foreach (var entry in budgetEntries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Sobrenome).HasColumnName("sobrenome").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.SenhaHash).HasColumnName("senha_hash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Bio).HasColumnName("bio").HasMaxLength(500);
            entity.Property(e => e.Icone).HasColumnName("icone").HasMaxLength(255);
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();
            entity.Property(e => e.Ativo).HasColumnName("ativo").IsRequired();
            entity.Property(e => e.SubscriptionId).HasColumnName("subscription_id");

            entity.HasIndex(e => e.SubscriptionId);
        });

        modelBuilder.Entity<Workspace>(entity =>
        {
            entity.ToTable("workspaces");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.Theme).HasColumnName("theme").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Language).HasColumnName("language").HasMaxLength(10).IsRequired();
            entity.Property(e => e.Timezone).HasColumnName("timezone").HasMaxLength(50).IsRequired();
            entity.Property(e => e.DateFormat).HasColumnName("date_format").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.MaxMembers).HasColumnName("max_members").IsRequired();
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();
            entity.Property(e => e.Ativo).HasColumnName("ativo").IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.ToTable("groups");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descricao).HasColumnName("descricao").HasMaxLength(500);
            entity.Property(e => e.Icone).HasColumnName("icone").HasMaxLength(10).IsRequired();
            entity.Property(e => e.Cor).HasColumnName("cor").HasMaxLength(20).IsRequired();
            entity.Property(e => e.Expandido).HasColumnName("expandido").IsRequired();
            entity.Property(e => e.Favorito).HasColumnName("favorito").IsRequired();
            entity.Property(e => e.Arquivado).HasColumnName("arquivado").IsRequired();
            entity.Property(e => e.Posicao).HasColumnName("posicao").IsRequired();
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();

            entity.HasOne(e => e.Workspace)
                .WithMany(w => w.Groups)
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => new { e.WorkspaceId, e.Posicao });
        });

        modelBuilder.Entity<Page>(entity =>
        {
            entity.ToTable("pages");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GroupId).HasColumnName("group_id").IsRequired();
            entity.Property(e => e.Nome).HasColumnName("nome").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Template).HasColumnName("template").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Icone).HasColumnName("icone").HasMaxLength(10);
            entity.Property(e => e.Data).HasColumnName("data").HasColumnType("TEXT").IsRequired();
            entity.Property(e => e.Favorito).HasColumnName("favorito").IsRequired();
            entity.Property(e => e.Posicao).HasColumnName("posicao").IsRequired();
            entity.Property(e => e.CriadoEm).HasColumnName("criado_em").IsRequired();
            entity.Property(e => e.AtualizadoEm).HasColumnName("atualizado_em").IsRequired();

            entity.HasOne(e => e.Group)
                .WithMany(g => g.Pages)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.GroupId);
            entity.HasIndex(e => new { e.GroupId, e.Posicao });
            entity.HasIndex(e => e.Favorito);
        });

        modelBuilder.Entity<PromoCode>(entity =>
        {
            entity.ToTable("promo_codes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
            entity.Property(e => e.DiscountPercentage).HasColumnName("discount_percentage").IsRequired();
            entity.Property(e => e.MaxUses).HasColumnName("max_uses").IsRequired();
            entity.Property(e => e.CurrentUses).HasColumnName("current_uses").IsRequired();
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        });

        modelBuilder.Entity<WorkspaceMember>(entity =>
        {
            entity.ToTable("workspace_members");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.Role).HasColumnName("role").IsRequired();
            entity.Property(e => e.JoinedAt).HasColumnName("joined_at").IsRequired();
            entity.Property(e => e.LastAccessAt).HasColumnName("last_access_at");
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();

            entity.HasOne(e => e.Workspace)
                .WithMany(w => w.Members)
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.WorkspaceId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<WorkspaceInvitation>(entity =>
        {
            entity.ToTable("workspace_invitations");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(100).IsRequired();
            entity.Property(e => e.InvitedByUserId).HasColumnName("invited_by_user_id").IsRequired();
            entity.Property(e => e.Role).HasColumnName("role").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();
            entity.Property(e => e.RespondedAt).HasColumnName("responded_at");
            entity.Property(e => e.InvitationToken).HasColumnName("invitation_token").HasMaxLength(100);

            entity.HasOne(e => e.Workspace)
                .WithMany(w => w.Invitations)
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.InvitedByUser)
                .WithMany()
                .HasForeignKey(e => e.InvitedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.InvitationToken).IsUnique();
        });

        modelBuilder.Entity<GroupPermission>(entity =>
        {
            entity.ToTable("group_permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.GroupId).HasColumnName("group_id").IsRequired();
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.CanView).HasColumnName("can_view").IsRequired();
            entity.Property(e => e.CanEdit).HasColumnName("can_edit").IsRequired();
            entity.Property(e => e.CanDelete).HasColumnName("can_delete").IsRequired();
            entity.Property(e => e.CanManagePages).HasColumnName("can_manage_pages").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.Group)
                .WithMany()
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.GroupId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.GroupId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.ToTable("subscriptions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.PlanType).HasColumnName("plan_type").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.BillingInterval).HasColumnName("billing_interval").IsRequired();
            entity.Property(e => e.CurrentPeriodStart).HasColumnName("current_period_start").IsRequired();
            entity.Property(e => e.CurrentPeriodEnd).HasColumnName("current_period_end").IsRequired();
            entity.Property(e => e.CancelAtPeriodEnd).HasColumnName("cancel_at_period_end").IsRequired();
            entity.Property(e => e.StripeCustomerId).HasColumnName("stripe_customer_id").HasMaxLength(100);
            entity.Property(e => e.StripeSubscriptionId).HasColumnName("stripe_subscription_id").HasMaxLength(100);
            entity.Property(e => e.StripePaymentMethodId).HasColumnName("stripe_payment_method_id").HasMaxLength(100);
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.User)
                .WithOne(u => u.Subscription)
                .HasForeignKey<Subscription>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId).IsUnique();
            entity.HasIndex(e => e.StripeCustomerId);
            entity.HasIndex(e => e.StripeSubscriptionId);
        });

        modelBuilder.Entity<TeamMember>(entity =>
        {
            entity.ToTable("team_members");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.Role).HasColumnName("role").IsRequired();
            entity.Property(e => e.CustomTitle).HasColumnName("custom_title").HasMaxLength(100);
            entity.Property(e => e.CanInviteMembers).HasColumnName("can_invite_members").IsRequired();
            entity.Property(e => e.CanRemoveMembers).HasColumnName("can_remove_members").IsRequired();
            entity.Property(e => e.CanManageProjects).HasColumnName("can_manage_projects").IsRequired();
            entity.Property(e => e.CanDeleteProjects).HasColumnName("can_delete_projects").IsRequired();
            entity.Property(e => e.CanManageIntegrations).HasColumnName("can_manage_integrations").IsRequired();
            entity.Property(e => e.CanExportData).HasColumnName("can_export_data").IsRequired();
            entity.Property(e => e.InvitedAt).HasColumnName("invited_at").IsRequired();
            entity.Property(e => e.JoinedAt).HasColumnName("joined_at");
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.WorkspaceId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<PagePermission>(entity =>
        {
            entity.ToTable("page_permissions");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.PageId).HasColumnName("page_id").IsRequired();
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.CanView).HasColumnName("can_view").IsRequired();
            entity.Property(e => e.CanEdit).HasColumnName("can_edit").IsRequired();
            entity.Property(e => e.CanComment).HasColumnName("can_comment").IsRequired();
            entity.Property(e => e.CanDelete).HasColumnName("can_delete").IsRequired();
            entity.Property(e => e.CanShare).HasColumnName("can_share").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.Page)
                .WithMany()
                .HasForeignKey(e => e.PageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.PageId);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => new { e.PageId, e.UserId }).IsUnique();
        });

        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.ToTable("sprints");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.PageId).HasColumnName("page_id").IsRequired();
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Goal).HasColumnName("goal").HasMaxLength(1000);
            entity.Property(e => e.StartDate).HasColumnName("start_date").IsRequired();
            entity.Property(e => e.EndDate).HasColumnName("end_date").IsRequired();
            entity.Property(e => e.TotalStoryPoints).HasColumnName("total_story_points").IsRequired();
            entity.Property(e => e.CommittedStoryPoints).HasColumnName("committed_story_points").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => e.PageId);
            entity.HasIndex(e => new { e.WorkspaceId, e.Status });
        });

        modelBuilder.Entity<SprintTask>(entity =>
        {
            entity.ToTable("sprint_tasks");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.SprintId).HasColumnName("sprint_id").IsRequired();
            entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(500).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
            entity.Property(e => e.StoryPoints).HasColumnName("story_points").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.Priority).HasColumnName("priority").IsRequired();
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.AssignedTo).HasColumnName("assigned_to");
            entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("TEXT")
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                );
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
            entity.Property(e => e.Order).HasColumnName("order").IsRequired();

            entity.HasOne(e => e.Sprint)
                .WithMany(s => s.Tasks)
                .HasForeignKey(e => e.SprintId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.AssignedUser)
                .WithMany()
                .HasForeignKey(e => e.AssignedTo)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.SprintId);
            entity.HasIndex(e => e.AssignedTo);
            entity.HasIndex(e => new { e.SprintId, e.Status });
        });

        modelBuilder.Entity<UserAchievement>(entity =>
        {
            entity.ToTable("user_achievements");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.Tier).HasColumnName("tier").IsRequired();
            entity.Property(e => e.CurrentValue).HasColumnName("current_value").IsRequired();
            entity.Property(e => e.RequiredValue).HasColumnName("required_value").IsRequired();
            entity.Property(e => e.Progress).HasColumnName("progress").IsRequired();
            entity.Property(e => e.UnlockedAt).HasColumnName("unlocked_at");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => new { e.UserId, e.WorkspaceId, e.Type, e.Tier }).IsUnique();
        });

        modelBuilder.Entity<UserBadge>(entity =>
        {
            entity.ToTable("user_badges");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.Type).HasColumnName("type").IsRequired();
            entity.Property(e => e.Rarity).HasColumnName("rarity").IsRequired();
            entity.Property(e => e.EarnedAt).HasColumnName("earned_at").IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => new { e.UserId, e.WorkspaceId, e.Type }).IsUnique();
        });

        modelBuilder.Entity<UserStats>(entity =>
        {
            entity.ToTable("user_stats");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.TotalPoints).HasColumnName("total_points").IsRequired();
            entity.Property(e => e.Experience).HasColumnName("experience").IsRequired();
            entity.Property(e => e.Level).HasColumnName("level").IsRequired();
            entity.Property(e => e.TasksCompleted).HasColumnName("tasks_completed").IsRequired();
            entity.Property(e => e.SprintsCompleted).HasColumnName("sprints_completed").IsRequired();
            entity.Property(e => e.CurrentStreak).HasColumnName("current_streak").IsRequired();
            entity.Property(e => e.LongestStreak).HasColumnName("longest_streak").IsRequired();
            entity.Property(e => e.LastActivityDate).HasColumnName("last_activity_date");
            entity.Property(e => e.AverageVelocity).HasColumnName("average_velocity").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => new { e.UserId, e.WorkspaceId }).IsUnique();
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.ToTable("budgets");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.WorkspaceId).HasColumnName("workspace_id").IsRequired();
            entity.Property(e => e.PageId).HasColumnName("page_id").IsRequired();
            entity.Property(e => e.BudgetNumber).HasColumnName("budget_number").HasMaxLength(50).IsRequired();
            entity.Property(e => e.ClientName).HasColumnName("client_name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.ClientEmail).HasColumnName("client_email").HasMaxLength(200);
            entity.Property(e => e.ClientCompany).HasColumnName("client_company").HasMaxLength(200);
            entity.Property(e => e.ProjectName).HasColumnName("project_name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.ProjectDescription).HasColumnName("project_description").HasMaxLength(2000);
            entity.Property(e => e.CalculationType).HasColumnName("calculation_type").IsRequired();
            entity.Property(e => e.Status).HasColumnName("status").IsRequired();
            entity.Property(e => e.TotalAmount).HasColumnName("total_amount").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.DiscountPercentage).HasColumnName("discount_percentage").HasColumnType("decimal(5,2)").IsRequired();
            entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.FinalAmount).HasColumnName("final_amount").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(10).IsRequired();
            entity.Property(e => e.ValidityDays).HasColumnName("validity_days").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
            entity.Property(e => e.SentAt).HasColumnName("sent_at");
            entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
            entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
            entity.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(2000);
            entity.Property(e => e.TermsAndConditions).HasColumnName("terms_and_conditions").HasColumnType("TEXT");
            entity.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();

            entity.HasOne(e => e.Workspace)
                .WithMany()
                .HasForeignKey(e => e.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.WorkspaceId);
            entity.HasIndex(e => e.PageId);
            entity.HasIndex(e => e.BudgetNumber).IsUnique();
            entity.HasIndex(e => new { e.WorkspaceId, e.Status });
        });

        modelBuilder.Entity<BudgetItem>(entity =>
        {
            entity.ToTable("budget_items");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BudgetId).HasColumnName("budget_id").IsRequired();
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
            entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
            entity.Property(e => e.Quantity).HasColumnName("quantity").IsRequired();
            entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.EstimatedHours).HasColumnName("estimated_hours").IsRequired();
            entity.Property(e => e.HourlyRate).HasColumnName("hourly_rate").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Complexity).HasColumnName("complexity").IsRequired();
            entity.Property(e => e.Order).HasColumnName("order").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();

            entity.HasOne(e => e.Budget)
                .WithMany(b => b.Items)
                .HasForeignKey(e => e.BudgetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.BudgetId);
            entity.HasIndex(e => new { e.BudgetId, e.Order });
        });

        modelBuilder.Entity<BudgetPhase>(entity =>
        {
            entity.ToTable("budget_phases");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.BudgetId).HasColumnName("budget_id").IsRequired();
            entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
            entity.Property(e => e.DurationDays).HasColumnName("duration_days").IsRequired();
            entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(18,2)").IsRequired();
            entity.Property(e => e.Order).HasColumnName("order").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();

            entity.HasOne(e => e.Budget)
                .WithMany(b => b.Phases)
                .HasForeignKey(e => e.BudgetId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.BudgetId);
            entity.HasIndex(e => new { e.BudgetId, e.Order });
        });
    }
}

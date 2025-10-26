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
    }
}

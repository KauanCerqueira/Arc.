using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class WorkspaceRepository : IWorkspaceRepository
{
    private readonly AppDbContext _context;

    public WorkspaceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Workspace?> GetByIdAsync(Guid id)
    {
        return await _context.Workspaces
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id && w.Ativo);
    }

    public async Task<Workspace?> GetByUserIdAsync(Guid userId)
    {
        return await _context.Workspaces
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId && w.Ativo);
    }

    public async Task<List<Workspace>> GetAllByUserIdAsync(Guid userId)
    {
        // Retorna workspaces onde o usuário é OWNER OU MEMBER
        var ownedWorkspaces = _context.Workspaces
            .AsNoTracking()
            .Where(w => w.UserId == userId && w.Ativo);

        var memberWorkspaces = _context.WorkspaceMembers
            .AsNoTracking()
            .Where(wm => wm.UserId == userId && wm.IsActive)
            .Select(wm => wm.Workspace!)
            .Where(w => w != null && w.Ativo);

        var allWorkspaces = await ownedWorkspaces
            .Union(memberWorkspaces)
            .OrderByDescending(w => w.AtualizadoEm)
            .ToListAsync();

        return allWorkspaces;
    }

    public async Task<Workspace?> GetWithGroupsAndPagesAsync(Guid userId, Guid workspaceId)
    {
        // Verifica se o usuário é owner OU member do workspace
        var workspace = await _context.Workspaces
            .AsNoTracking()
            .Include(w => w.Groups.OrderBy(g => g.Posicao))
                .ThenInclude(g => g.Pages.OrderBy(p => p.Posicao))
            .FirstOrDefaultAsync(w => w.Id == workspaceId && w.Ativo);

        if (workspace == null)
            return null;

        // Verificar se o usuário tem acesso (é owner OU é member)
        var isOwner = workspace.UserId == userId;
        var isMember = await _context.WorkspaceMembers
            .AnyAsync(wm => wm.WorkspaceId == workspaceId && wm.UserId == userId && wm.IsActive);

        return (isOwner || isMember) ? workspace : null;
    }

    public async Task<Workspace> CreateAsync(Workspace workspace)
    {
        await _context.Workspaces.AddAsync(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task<Workspace> UpdateAsync(Workspace workspace)
    {
        _context.Workspaces.Update(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task DeleteAsync(Guid id)
    {
        var workspace = await _context.Workspaces.FindAsync(id);
        if (workspace != null)
        {
            workspace.Ativo = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Workspace>> GetAllAsync()
    {
        return await _context.Workspaces
            .AsNoTracking()
            .Where(w => w.Ativo)
            .ToListAsync();
    }
}

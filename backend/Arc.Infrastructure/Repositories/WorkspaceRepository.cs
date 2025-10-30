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
        return await _context.Workspaces
            .AsNoTracking()
            .Where(w => w.UserId == userId && w.Ativo)
            .OrderByDescending(w => w.AtualizadoEm)
            .ToListAsync();
    }

    public async Task<Workspace?> GetWithGroupsAndPagesAsync(Guid userId, Guid workspaceId)
    {
        return await _context.Workspaces
            .AsNoTracking()
            .Include(w => w.Groups.OrderBy(g => g.Posicao))
                .ThenInclude(g => g.Pages.OrderBy(p => p.Posicao))
            .FirstOrDefaultAsync(w => w.Id == workspaceId && w.UserId == userId && w.Ativo);
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

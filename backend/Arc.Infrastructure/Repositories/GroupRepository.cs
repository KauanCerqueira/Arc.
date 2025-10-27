using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class GroupRepository : IGroupRepository
{
    private readonly AppDbContext _context;

    public GroupRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Group?> GetByIdAsync(Guid id)
    {
        return await _context.Groups
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<Group?> GetWithPagesAsync(Guid id)
    {
        return await _context.Groups
            .AsNoTracking()
            .Include(g => g.Pages.OrderBy(p => p.Posicao))
            .FirstOrDefaultAsync(g => g.Id == id);
    }

    public async Task<IEnumerable<Group>> GetByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.Groups
            .AsNoTracking()
            .Where(g => g.WorkspaceId == workspaceId && !g.Arquivado)
            .OrderBy(g => g.Posicao)
            .ToListAsync();
    }

    public async Task<Group> CreateAsync(Group group)
    {
        await _context.Groups.AddAsync(group);
        await _context.SaveChangesAsync();
        return group;
    }

    public async Task<Group> UpdateAsync(Group group)
    {
        _context.Groups.Update(group);
        await _context.SaveChangesAsync();
        return group;
    }

    public async Task DeleteAsync(Guid id)
    {
        var group = await _context.Groups.FindAsync(id);
        if (group != null)
        {
            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ReorderAsync(Guid workspaceId, List<Guid> groupIds)
    {
        var groups = await _context.Groups
            .Where(g => g.WorkspaceId == workspaceId && groupIds.Contains(g.Id))
            .ToListAsync();

        for (int i = 0; i < groupIds.Count; i++)
        {
            var group = groups.FirstOrDefault(g => g.Id == groupIds[i]);
            if (group != null)
            {
                group.Posicao = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Group>> GetAllAsync()
    {
        return await _context.Groups
            .AsNoTracking()
            .Where(g => !g.Arquivado)
            .ToListAsync();
    }
}

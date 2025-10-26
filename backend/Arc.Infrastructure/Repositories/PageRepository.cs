using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class PageRepository : IPageRepository
{
    private readonly AppDbContext _context;

    public PageRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Page?> GetByIdAsync(Guid id)
    {
        return await _context.Pages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Group?> GetGroupByPageIdAsync(Guid pageId)
    {
        var page = await _context.Pages
            .AsNoTracking()
            .Include(p => p.Group)
            .FirstOrDefaultAsync(p => p.Id == pageId);

        return page?.Group;
    }

    public async Task<IEnumerable<Page>> GetByGroupIdAsync(Guid groupId)
    {
        return await _context.Pages
            .AsNoTracking()
            .Where(p => p.GroupId == groupId)
            .OrderBy(p => p.Posicao)
            .ToListAsync();
    }

    public async Task<IEnumerable<Page>> GetFavoritesByWorkspaceIdAsync(Guid workspaceId)
    {
        return await _context.Pages
            .AsNoTracking()
            .Include(p => p.Group)
            .Where(p => p.Group!.WorkspaceId == workspaceId && p.Favorito)
            .OrderBy(p => p.Nome)
            .ToListAsync();
    }

    public async Task<IEnumerable<Page>> SearchAsync(Guid workspaceId, string query)
    {
        var lowerQuery = query.ToLower();

        return await _context.Pages
            .AsNoTracking()
            .Include(p => p.Group)
            .Where(p => p.Group!.WorkspaceId == workspaceId &&
                       (p.Nome.ToLower().Contains(lowerQuery) ||
                        p.Group!.Nome.ToLower().Contains(lowerQuery)))
            .OrderBy(p => p.Nome)
            .ToListAsync();
    }

    public async Task<Page> CreateAsync(Page page)
    {
        await _context.Pages.AddAsync(page);
        await _context.SaveChangesAsync();
        return page;
    }

    public async Task<Page> UpdateAsync(Page page)
    {
        _context.Pages.Update(page);
        await _context.SaveChangesAsync();
        return page;
    }

    public async Task DeleteAsync(Guid id)
    {
        var page = await _context.Pages.FindAsync(id);
        if (page != null)
        {
            _context.Pages.Remove(page);
            await _context.SaveChangesAsync();
        }
    }

    public async Task ReorderAsync(Guid groupId, List<Guid> pageIds)
    {
        var pages = await _context.Pages
            .Where(p => p.GroupId == groupId && pageIds.Contains(p.Id))
            .ToListAsync();

        for (int i = 0; i < pageIds.Count; i++)
        {
            var page = pages.FirstOrDefault(p => p.Id == pageIds[i]);
            if (page != null)
            {
                page.Posicao = i;
            }
        }

        await _context.SaveChangesAsync();
    }

    public async Task MoveToGroupAsync(Guid pageId, Guid newGroupId)
    {
        var page = await _context.Pages.FindAsync(pageId);
        if (page != null)
        {
            page.GroupId = newGroupId;

            // Reposicionar no final do novo grupo
            var maxPosition = await _context.Pages
                .Where(p => p.GroupId == newGroupId)
                .MaxAsync(p => (int?)p.Posicao) ?? -1;

            page.Posicao = maxPosition + 1;

            await _context.SaveChangesAsync();
        }
    }
}

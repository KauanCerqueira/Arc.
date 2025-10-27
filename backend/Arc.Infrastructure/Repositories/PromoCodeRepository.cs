using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Arc.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Arc.Infrastructure.Repositories;

public class PromoCodeRepository : IPromoCodeRepository
{
    private readonly AppDbContext _context;

    public PromoCodeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PromoCode?> GetByIdAsync(Guid id)
    {
        return await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<PromoCode?> GetByCodeAsync(string code)
    {
        return await _context.PromoCodes
            .FirstOrDefaultAsync(p => p.Code == code);
    }

    public async Task<IEnumerable<PromoCode>> GetAllAsync()
    {
        return await _context.PromoCodes
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<PromoCode> CreateAsync(PromoCode promoCode)
    {
        promoCode.Id = Guid.NewGuid();
        promoCode.CreatedAt = DateTime.UtcNow;
        promoCode.CurrentUses = 0;

        _context.PromoCodes.Add(promoCode);
        await _context.SaveChangesAsync();
        return promoCode;
    }

    public async Task UpdateAsync(PromoCode promoCode)
    {
        _context.PromoCodes.Update(promoCode);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var promoCode = await GetByIdAsync(id);
        if (promoCode != null)
        {
            _context.PromoCodes.Remove(promoCode);
            await _context.SaveChangesAsync();
        }
    }
}

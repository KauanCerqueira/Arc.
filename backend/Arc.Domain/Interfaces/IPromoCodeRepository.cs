using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IPromoCodeRepository
{
    Task<PromoCode?> GetByIdAsync(Guid id);
    Task<PromoCode?> GetByCodeAsync(string code);
    Task<IEnumerable<PromoCode>> GetAllAsync();
    Task<PromoCode> CreateAsync(PromoCode promoCode);
    Task UpdateAsync(PromoCode promoCode);
    Task DeleteAsync(Guid id);
}

using Arc.Domain.Entities;

namespace Arc.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
    DateTime GetTokenExpiration();
}

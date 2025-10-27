using Arc.Application.DTOs.Auth;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;

namespace Arc.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public AuthService(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
            throw new InvalidOperationException("Email já cadastrado");

        var senhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha);

        var user = new User
        {
            Nome = request.Nome,
            Sobrenome = request.Sobrenome,
            Email = request.Email.ToLower(),
            SenhaHash = senhaHash,
            Bio = request.Bio,
            Icone = request.Icone,
            Profissao = request.Profissao,
            ComoConheceu = request.ComoConheceu
        };

        var createdUser = await _userRepository.CreateAsync(user);
        var token = _tokenService.GenerateToken(createdUser);
        var expiration = _tokenService.GetTokenExpiration();

        return new AuthResponseDto
        {
            UserId = createdUser.Id,
            Nome = createdUser.Nome,
            Sobrenome = createdUser.Sobrenome,
            Email = createdUser.Email,
            Bio = createdUser.Bio,
            Icone = createdUser.Icone,
            Profissao = createdUser.Profissao,
            ComoConheceu = createdUser.ComoConheceu,
            IsMaster = createdUser.IsMaster,
            Token = token,
            ExpiresAt = expiration
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Credenciais inválidas");

        if (!user.Ativo)
            throw new UnauthorizedAccessException("Usuário inativo");

        if (!BCrypt.Net.BCrypt.Verify(request.Senha, user.SenhaHash))
            throw new UnauthorizedAccessException("Credenciais inválidas");

        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();

        return new AuthResponseDto
        {
            UserId = user.Id,
            Nome = user.Nome,
            Sobrenome = user.Sobrenome,
            Email = user.Email,
            Bio = user.Bio,
            Icone = user.Icone,
            Profissao = user.Profissao,
            ComoConheceu = user.ComoConheceu,
            IsMaster = user.IsMaster,
            Token = token,
            ExpiresAt = expiration
        };
    }

    public async Task<UserProfileDto> GetProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado");

        return new UserProfileDto
        {
            UserId = user.Id,
            Nome = user.Nome,
            Sobrenome = user.Sobrenome,
            Email = user.Email,
            Bio = user.Bio,
            Icone = user.Icone,
            Profissao = user.Profissao,
            ComoConheceu = user.ComoConheceu,
            IsMaster = user.IsMaster,
            CriadoEm = user.CriadoEm
        };
    }

    public async Task<UserProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado");

        user.Nome = request.Nome;
        user.Sobrenome = request.Sobrenome;
        user.Bio = request.Bio;
        user.Icone = request.Icone;
        user.AtualizadoEm = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

        return new UserProfileDto
        {
            UserId = user.Id,
            Nome = user.Nome,
            Sobrenome = user.Sobrenome,
            Email = user.Email,
            Bio = user.Bio,
            Icone = user.Icone,
            Profissao = user.Profissao,
            ComoConheceu = user.ComoConheceu,
            IsMaster = user.IsMaster,
            CriadoEm = user.CriadoEm
        };
    }

    public async Task UpdatePasswordAsync(Guid userId, UpdatePasswordRequestDto request)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado");

        if (!BCrypt.Net.BCrypt.Verify(request.SenhaAtual, user.SenhaHash))
            throw new UnauthorizedAccessException("Senha atual incorreta");

        user.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        user.AtualizadoEm = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
    }
}

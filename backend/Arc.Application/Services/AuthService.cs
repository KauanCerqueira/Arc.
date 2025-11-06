using Arc.Application.DTOs.Auth;
using Arc.Application.Interfaces;
using Arc.Domain.Entities;
using Arc.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;

namespace Arc.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
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

        // Gerar refresh token para manter login persistente
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _tokenService.GetRefreshTokenExpiration();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;
        user.AtualizadoEm = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

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
            ExpiresAt = expiration,
            RefreshToken = refreshToken
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

    public string GetOAuthUrl(string provider, string? redirectUri = null)
    {
        var clientId = _configuration[$"OAuth:{provider.ToLower() switch { "google" => "Google", "github" => "GitHub", _ => throw new ArgumentException("Provider inválido") }}:ClientId"];
        var configuredRedirectUri = redirectUri ?? _configuration[$"OAuth:{provider.ToLower() switch { "google" => "Google", "github" => "GitHub", _ => throw new ArgumentException("Provider inválido") }}:RedirectUri"];

        if (string.IsNullOrEmpty(clientId))
            throw new InvalidOperationException($"OAuth {provider} não está configurado");

        return provider.ToLower() switch
        {
            "google" => BuildGoogleAuthUrl(clientId, configuredRedirectUri!),
            "github" => BuildGitHubAuthUrl(clientId, configuredRedirectUri!),
            _ => throw new ArgumentException("Provider não suportado")
        };
    }

    public async Task<AuthResponseDto> OAuthLoginAsync(string provider, string code, string? redirectUri = null)
    {
        var userInfo = await GetOAuthUserInfoAsync(provider, code, redirectUri);

        // Buscar ou criar usuário
        var user = await _userRepository.GetByEmailAsync(userInfo.Email);

        if (user == null)
        {
            // Criar novo usuário a partir dos dados OAuth
            user = new User
            {
                Nome = userInfo.Nome,
                Sobrenome = userInfo.Sobrenome,
                Email = userInfo.Email.ToLower(),
                Icone = userInfo.Icone,
                SenhaHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Senha aleatória
                ComoConheceu = $"OAuth {provider}"
            };

            user = await _userRepository.CreateAsync(user);
        }

        // Gerar tokens
        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _tokenService.GetRefreshTokenExpiration();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;
        user.AtualizadoEm = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

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
            ExpiresAt = expiration,
            RefreshToken = refreshToken
        };
    }

    #region OAuth Helpers

    private string BuildGoogleAuthUrl(string clientId, string redirectUri)
    {
        var scopes = _configuration.GetSection("OAuth:Google:Scopes").Get<string[]>();
        var scopeString = string.Join(" ", scopes ?? new[] { "openid", "email", "profile" });

        return $"https://accounts.google.com/o/oauth2/v2/auth?" +
               $"client_id={Uri.EscapeDataString(clientId)}&" +
               $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
               $"response_type=code&" +
               $"scope={Uri.EscapeDataString(scopeString)}&" +
               $"access_type=offline&" +
               $"prompt=consent";
    }

    private string BuildGitHubAuthUrl(string clientId, string redirectUri)
    {
        return $"https://github.com/login/oauth/authorize?" +
               $"client_id={Uri.EscapeDataString(clientId)}&" +
               $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
               $"scope=user:email,repo,read:org";
    }

    private async Task<OAuthUserInfoDto> GetOAuthUserInfoAsync(string provider, string code, string? redirectUri)
    {
        return provider.ToLower() switch
        {
            "google" => await GetGoogleUserInfoAsync(code, redirectUri),
            "github" => await GetGitHubUserInfoAsync(code, redirectUri),
            _ => throw new ArgumentException("Provider não suportado")
        };
    }

    private async Task<OAuthUserInfoDto> GetGoogleUserInfoAsync(string code, string? redirectUri)
    {
        var clientId = _configuration["OAuth:Google:ClientId"];
        var clientSecret = _configuration["OAuth:Google:ClientSecret"];
        var configuredRedirectUri = redirectUri ?? _configuration["OAuth:Google:RedirectUri"];

        // Trocar código por token
        var client = _httpClientFactory.CreateClient();
        var tokenResponse = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = clientId!,
            ["client_secret"] = clientSecret!,
            ["redirect_uri"] = configuredRedirectUri!,
            ["grant_type"] = "authorization_code"
        }));

        tokenResponse.EnsureSuccessStatusCode();
        var tokenData = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = tokenData.GetProperty("access_token").GetString();

        // Obter informações do usuário
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        var userResponse = await client.GetAsync("https://www.googleapis.com/oauth2/v2/userinfo");
        userResponse.EnsureSuccessStatusCode();
        var userData = await userResponse.Content.ReadFromJsonAsync<JsonElement>();

        var fullName = userData.GetProperty("name").GetString() ?? "";
        var nameParts = fullName.Split(' ', 2);

        return new OAuthUserInfoDto
        {
            Email = userData.GetProperty("email").GetString()!,
            Nome = nameParts[0],
            Sobrenome = nameParts.Length > 1 ? nameParts[1] : null,
            Icone = userData.TryGetProperty("picture", out var picture) ? picture.GetString() : null,
            Provider = "Google",
            ProviderId = userData.GetProperty("id").GetString()!
        };
    }

    private async Task<OAuthUserInfoDto> GetGitHubUserInfoAsync(string code, string? redirectUri)
    {
        var clientId = _configuration["OAuth:GitHub:ClientId"];
        var clientSecret = _configuration["OAuth:GitHub:ClientSecret"];

        // Trocar código por token
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Accept", "application/json");

        var tokenResponse = await client.PostAsync("https://github.com/login/oauth/access_token", new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["code"] = code,
            ["client_id"] = clientId!,
            ["client_secret"] = clientSecret!
        }));

        tokenResponse.EnsureSuccessStatusCode();
        var tokenData = await tokenResponse.Content.ReadFromJsonAsync<JsonElement>();
        var accessToken = tokenData.GetProperty("access_token").GetString();

        // Obter informações do usuário
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);
        client.DefaultRequestHeaders.Add("User-Agent", "Arc-App");

        var userResponse = await client.GetAsync("https://api.github.com/user");
        userResponse.EnsureSuccessStatusCode();
        var userData = await userResponse.Content.ReadFromJsonAsync<JsonElement>();

        var fullName = userData.TryGetProperty("name", out var nameElement) && !nameElement.ValueKind.Equals(JsonValueKind.Null)
            ? nameElement.GetString()
            : userData.GetProperty("login").GetString();
        var nameParts = (fullName ?? "").Split(' ', 2);

        // Obter email primário se não estiver público
        var email = userData.TryGetProperty("email", out var emailElement) && !emailElement.ValueKind.Equals(JsonValueKind.Null)
            ? emailElement.GetString()
            : null;

        if (string.IsNullOrEmpty(email))
        {
            var emailsResponse = await client.GetAsync("https://api.github.com/user/emails");
            if (emailsResponse.IsSuccessStatusCode)
            {
                var emailsData = await emailsResponse.Content.ReadFromJsonAsync<JsonElement>();
                var primaryEmail = emailsData.EnumerateArray()
                    .FirstOrDefault(e => e.GetProperty("primary").GetBoolean());
                email = primaryEmail.GetProperty("email").GetString();
            }
        }

        return new OAuthUserInfoDto
        {
            Email = email ?? throw new InvalidOperationException("Não foi possível obter o email do GitHub"),
            Nome = nameParts[0],
            Sobrenome = nameParts.Length > 1 ? nameParts[1] : null,
            Icone = userData.TryGetProperty("avatar_url", out var avatar) ? avatar.GetString() : null,
            Provider = "GitHub",
            ProviderId = userData.GetProperty("id").GetInt64().ToString()
        };
    }

    #endregion

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

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(refreshToken)
            ?? throw new UnauthorizedAccessException("Refresh token inválido");

        if (!user.Ativo)
            throw new UnauthorizedAccessException("Usuário inativo");

        if (user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            throw new UnauthorizedAccessException("Refresh token expirado");

        // Gerar novos tokens
        var token = _tokenService.GenerateToken(user);
        var expiration = _tokenService.GetTokenExpiration();
        var newRefreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = _tokenService.GetRefreshTokenExpiration();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = refreshTokenExpiry;
        user.AtualizadoEm = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);

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
            ExpiresAt = expiration,
            RefreshToken = newRefreshToken
        };
    }
}

using Arc.Application.DTOs.Auth;
using Arc.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Arc.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Registra um novo usuário no sistema
    /// </summary>
    /// <param name="request">Dados do usuário a ser registrado</param>
    /// <returns>Dados do usuário registrado com token de autenticação</returns>
    /// <response code="201">Usuário registrado com sucesso</response>
    /// <response code="400">Dados inválidos ou email já cadastrado</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Tentativa de registro com dados inválidos");
            return BadRequest(ModelState);
        }

        _logger.LogInformation("Iniciando registro para email: {Email}", request.Email);
        var response = await _authService.RegisterAsync(request);
        _logger.LogInformation("Usuário registrado com sucesso. ID: {UserId}", response.UserId);

        return CreatedAtAction(nameof(Register), new { id = response.UserId }, response);
    }

    /// <summary>
    /// Realiza login no sistema
    /// </summary>
    /// <param name="request">Credenciais de login</param>
    /// <returns>Dados do usuário com token de autenticação</returns>
    /// <response code="200">Login realizado com sucesso</response>
    /// <response code="401">Credenciais inválidas</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Tentativa de login com dados inválidos");
            return BadRequest(ModelState);
        }

        _logger.LogInformation("Tentativa de login para email: {Email}", request.Email);
        var response = await _authService.LoginAsync(request);
        _logger.LogInformation("Login realizado com sucesso para usuário: {UserId}", response.UserId);

        return Ok(response);
    }

    /// <summary>
    /// Renova o token de autenticação usando refresh token
    /// </summary>
    /// <param name="request">Refresh token</param>
    /// <returns>Novos tokens de autenticação</returns>
    /// <response code="200">Token renovado com sucesso</response>
    /// <response code="401">Refresh token inválido ou expirado</response>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            _logger.LogWarning("Tentativa de refresh com dados inválidos");
            return BadRequest(ModelState);
        }

        _logger.LogInformation("Tentativa de refresh token");
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        _logger.LogInformation("Token renovado com sucesso para usuário: {UserId}", response.UserId);

        return Ok(response);
    }

    /// <summary>
    /// Verifica se o token de autenticação é válido
    /// </summary>
    /// <returns>Status de autenticação</returns>
    /// <response code="200">Token válido</response>
    /// <response code="401">Token inválido ou expirado</response>
    [HttpGet("verify")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Verify()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

        _logger.LogInformation("Token verificado para usuário: {UserId}", userId);

        return Ok(new
        {
            message = "Token válido",
            userId,
            email,
            timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Retorna o perfil do usuário autenticado
    /// </summary>
    /// <returns>Dados do perfil do usuário</returns>
    /// <response code="200">Perfil retornado com sucesso</response>
    /// <response code="401">Não autenticado</response>
    /// <response code="404">Usuário não encontrado</response>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        _logger.LogInformation("Buscando perfil do usuário: {UserId}", userId);
        var profile = await _authService.GetProfileAsync(userId);

        return Ok(profile);
    }

    /// <summary>
    /// Atualiza o perfil do usuário autenticado
    /// </summary>
    /// <param name="request">Dados a serem atualizados</param>
    /// <returns>Perfil atualizado</returns>
    /// <response code="200">Perfil atualizado com sucesso</response>
    /// <response code="400">Dados inválidos</response>
    /// <response code="401">Não autenticado</response>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        _logger.LogInformation("Atualizando perfil do usuário: {UserId}", userId);
        var profile = await _authService.UpdateProfileAsync(userId, request);
        _logger.LogInformation("Perfil atualizado com sucesso para usuário: {UserId}", userId);

        return Ok(profile);
    }

    /// <summary>
    /// Atualiza a senha do usuário autenticado
    /// </summary>
    /// <param name="request">Senha atual e nova senha</param>
    /// <returns>Status da operação</returns>
    /// <response code="200">Senha atualizada com sucesso</response>
    /// <response code="400">Dados inválidos</response>
    /// <response code="401">Senha atual incorreta ou não autenticado</response>
    [HttpPut("password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        _logger.LogInformation("Atualizando senha do usuário: {UserId}", userId);
        await _authService.UpdatePasswordAsync(userId, request);
        _logger.LogInformation("Senha atualizada com sucesso para usuário: {UserId}", userId);

        return Ok(new { message = "Senha atualizada com sucesso" });
    }
}

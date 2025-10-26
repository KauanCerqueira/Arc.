using System.ComponentModel.DataAnnotations;

namespace Arc.Application.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(50, MinimumLength = 2)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sobrenome é obrigatório")]
    [StringLength(50, MinimumLength = 2)]
    public string Sobrenome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email é obrigatório")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "A senha deve ter entre 8 e 100 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial")]
    public string Senha { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Bio { get; set; }

    [Url]
    public string? Icone { get; set; }
}

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public Guid UserId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Icone { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class UpdateProfileRequestDto
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(50, MinimumLength = 2)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Sobrenome é obrigatório")]
    [StringLength(50, MinimumLength = 2)]
    public string Sobrenome { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Bio { get; set; }

    [Url(ErrorMessage = "URL do ícone inválida")]
    public string? Icone { get; set; }
}

public class UpdatePasswordRequestDto
{
    [Required(ErrorMessage = "Senha atual é obrigatória")]
    public string SenhaAtual { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nova senha é obrigatória")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "A senha deve ter entre 8 e 100 caracteres")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial")]
    public string NovaSenha { get; set; } = string.Empty;
}

public class UserProfileDto
{
    public Guid UserId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Sobrenome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? Icone { get; set; }
    public DateTime CriadoEm { get; set; }
}

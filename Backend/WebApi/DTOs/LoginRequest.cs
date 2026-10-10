using System.ComponentModel.DataAnnotations;

namespace WebApi.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "O login é obrigatório.")]
    public string Login { get; set; } = null!;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    public string Senha { get; set; } = null!;
}

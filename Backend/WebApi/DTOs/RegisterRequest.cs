using System.ComponentModel.DataAnnotations;

namespace WebApi.DTOs;

public class RegisterRequest
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(100)]
    public string Nome { get; set; } = null!;

    [Required(ErrorMessage = "O login é obrigatório.")]
    [StringLength(100)]
    public string Login { get; set; } = null!;

    [Required(ErrorMessage = "A senha é obrigatória.")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "A senha deve ter no mínimo 6 caracteres.")]
    public string Senha { get; set; } = null!;
}

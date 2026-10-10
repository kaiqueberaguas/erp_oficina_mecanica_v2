using System.ComponentModel.DataAnnotations;

namespace WebApi.Parameters;

public class ClienteParameter
{
    [Required(ErrorMessage = "O nome é obrigatório.")]
    [StringLength(100)]
    public string Nome { get; set; } = null!;

    // Aceita com ou sem máscara; o serviço grava somente os dígitos.
    [Required(ErrorMessage = "O CPF é obrigatório.")]
    [StringLength(14)]
    public string Cpf { get; set; } = null!;

    [Required(ErrorMessage = "O contato é obrigatório.")]
    [StringLength(20)]
    public string Contato { get; set; } = null!;
}

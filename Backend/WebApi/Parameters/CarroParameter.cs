using System.ComponentModel.DataAnnotations;

namespace WebApi.Parameters;

public class CarroParameter
{
    [Range(1, int.MaxValue, ErrorMessage = "O cliente é obrigatório.")]
    public int ClienteId { get; set; }

    [Required(ErrorMessage = "A marca é obrigatória.")]
    [StringLength(50)]
    public string Marca { get; set; } = null!;

    [Required(ErrorMessage = "O modelo é obrigatório.")]
    [StringLength(50)]
    public string Modelo { get; set; } = null!;

    // ABC-1234 ou ABC1D23; o serviço grava em maiúsculas e sem hífen.
    [Required(ErrorMessage = "A placa é obrigatória.")]
    [StringLength(8)]
    public string Placa { get; set; } = null!;
}

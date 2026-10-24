using System.ComponentModel.DataAnnotations;
using WebApi.Models;

namespace WebApi.Parameters;

public class OrdemServicoParameter
{
    [Range(1, int.MaxValue, ErrorMessage = "O carro é obrigatório.")]
    public int CarroId { get; set; }

    [Required(ErrorMessage = "A descrição é obrigatória.")]
    public string DescricaoOrdem { get; set; } = null!;

    [Range(0, 99999999.99, ErrorMessage = "O valor do serviço é inválido.")]
    public decimal ValorServico { get; set; }

    // Quando omitida, assume a data de hoje.
    public DateOnly? DataEntradaCarro { get; set; }
}

public class AtualizarEtapaParameter
{
    [Required(ErrorMessage = "A etapa é obrigatória.")]
    public EtapaOrdem? Etapa { get; set; }

    public DateOnly? DataRetiradaVeiculo { get; set; }

    // Motivo do cancelamento (ou nota da mudança de etapa).
    public string? Observacao { get; set; }
}

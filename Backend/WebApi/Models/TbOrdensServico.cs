using System;
using System.Collections.Generic;

namespace WebApi.Models;

public partial class TbOrdensServico
{
    public int Id { get; set; }

    public int CarroId { get; set; }

    public string DescricaoOrdem { get; set; } = null!;

    public decimal ValorServico { get; set; }

    public EtapaOrdem Etapa { get; set; } = EtapaOrdem.Rascunho;

    public DateOnly DataEntradaCarro { get; set; }

    public DateOnly? DataInicioServico { get; set; }

    public DateOnly? DataFimServico { get; set; }

    public DateOnly? DataRetiradaVeiculo { get; set; }

    public virtual TbCarro Carro { get; set; } = null!;
}

using WebApi.Models;

namespace WebApi.Presenters;

public record OrdemServicoPresenter(
    int Id,
    int CarroId,
    string DescricaoOrdem,
    decimal ValorServico,
    EtapaOrdem Etapa,
    DateOnly DataEntradaCarro,
    DateOnly? DataInicioServico,
    DateOnly? DataFimServico,
    DateOnly? DataRetiradaVeiculo);

public record OrdemServicoDetalhePresenter(OrdemServicoPresenter Ordem, CarroPresenter Carro, ClientePresenter Cliente);

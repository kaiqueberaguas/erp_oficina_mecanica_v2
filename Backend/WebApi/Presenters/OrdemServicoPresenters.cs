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
    DateOnly? DataRetiradaVeiculo,
    string? Observacao = null,
    string? Placa = null,
    string? Marca = null,
    string? Modelo = null,
    string? ClienteNome = null);

public record OrdemServicoDetalhePresenter(OrdemServicoPresenter Ordem, CarroPresenter Carro, ClientePresenter Cliente);

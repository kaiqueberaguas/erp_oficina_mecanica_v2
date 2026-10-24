namespace WebApi.Presenters;

public record CarroResumoPresenter(int Id, string Marca, string Modelo, string Placa);

public record CarroPresenter(int Id, int ClienteId, string Marca, string Modelo, string Placa, int TotalOrdens = 0,
    string? ClienteNome = null);

public record CarroDetalhePresenter(
    int Id, int ClienteId, string Marca, string Modelo, string Placa, IReadOnlyList<OrdemServicoPresenter> Ordens);

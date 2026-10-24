namespace WebApi.Presenters;

public record ClientePresenter(int Id, string Nome, string Cpf, string Contato, int TotalCarros = 0);

public record ClienteDetalhePresenter(
    int Id, string Nome, string Cpf, string Contato, IReadOnlyList<CarroResumoPresenter> Carros);

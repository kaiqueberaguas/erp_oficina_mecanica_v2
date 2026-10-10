namespace WebApi.Presenters;

public record ClientePresenter(int Id, string Nome, string Cpf, string Contato);

public record ClienteDetalhePresenter(
    int Id, string Nome, string Cpf, string Contato, IReadOnlyList<CarroResumoPresenter> Carros);

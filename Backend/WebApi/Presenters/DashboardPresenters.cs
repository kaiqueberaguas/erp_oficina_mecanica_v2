namespace WebApi.Presenters;

public record DashboardKpisPresenter(
    decimal FaturamentoTotal,
    decimal TicketMedio,
    double TempoMedioReparoDias,
    int TotalOrdens);

public record StatusQuantidadePresenter(string Status, int Quantidade);

public record FaturamentoMensalPresenter(string Mes, decimal Valor, int Quantidade);

public record MarcaTotalPresenter(string Marca, int TotalOS);

public record DashboardPresenter(
    DashboardKpisPresenter Kpis,
    IReadOnlyList<StatusQuantidadePresenter> StatusDistribuicao,
    IReadOnlyList<FaturamentoMensalPresenter> FaturamentoMensal,
    IReadOnlyList<MarcaTotalPresenter> TopMarcas);

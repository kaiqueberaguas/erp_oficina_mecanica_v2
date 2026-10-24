using WebApi.Models;
using WebApi.Services;

namespace WebApi.Tests.Unit;

[Trait("Category", "Unit")]
public class DashboardServiceTests
{
    private readonly OficinaDbContext _db = DbFactory.Criar();
    private readonly DashboardService _service;
    private int _carroSeq;

    public DashboardServiceTests() => _service = new DashboardService(_db);

    private TbCarro NovoCarro(string marca)
    {
        var n = ++_carroSeq;
        var cliente = new TbCliente { Nome = $"Cliente {n}", Cpf = $"{n:00000000000}", Contato = "11999990000" };
        var carro = new TbCarro { Cliente = cliente, Marca = marca, Modelo = "X", Placa = $"AAA{n:0000}" };
        _db.TbCarros.Add(carro);
        return carro;
    }

    private void NovaOrdem(string marca, EtapaOrdem etapa, decimal valor,
        DateOnly? entrada = null, DateOnly? fim = null) =>
        _db.TbOrdensServicos.Add(new TbOrdensServico
        {
            Carro = NovoCarro(marca), DescricaoOrdem = "Serviço", ValorServico = valor, Etapa = etapa,
            DataEntradaCarro = entrada ?? new DateOnly(2026, 1, 1), DataFimServico = fim,
        });

    [Fact]
    public async Task Obter_SemOrdens_RetornaZeradoEListasVazias()
    {
        var d = await _service.ObterAsync();

        Assert.Equal(0, d.Kpis.TotalOrdens);
        Assert.Equal(0m, d.Kpis.FaturamentoTotal);
        Assert.Equal(0m, d.Kpis.TicketMedio);
        Assert.Equal(0, d.Kpis.TempoMedioReparoDias);
        Assert.Empty(d.StatusDistribuicao);
        Assert.Empty(d.FaturamentoMensal);
        Assert.Empty(d.TopMarcas);
    }

    [Fact]
    public async Task Obter_UmaFinalizada_TicketMedioIgualAoValor()
    {
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 250m, fim: new DateOnly(2026, 1, 3));
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Equal(250m, d.Kpis.FaturamentoTotal);
        Assert.Equal(250m, d.Kpis.TicketMedio);
    }

    [Fact]
    public async Task Obter_VariasOrdens_TicketMedioConsideraSoFinalizadas()
    {
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 100m, fim: new DateOnly(2026, 1, 2));
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 200m, fim: new DateOnly(2026, 1, 2));
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 600m, fim: new DateOnly(2026, 2, 2));
        NovaOrdem("Fiat", EtapaOrdem.EmAndamento, 9000m);
        NovaOrdem("Fiat", EtapaOrdem.Cancelada, 9000m);
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Equal(900m, d.Kpis.FaturamentoTotal);
        Assert.Equal(300m, d.Kpis.TicketMedio);
        Assert.Equal(5, d.Kpis.TotalOrdens);
    }

    [Fact]
    public async Task Obter_LeadTime_MediaEmDiasEntreEntradaEFim()
    {
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 1m, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 3));
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 1m, new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 6));
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Equal(3.5, d.Kpis.TempoMedioReparoDias);
    }

    [Fact]
    public void CalcularLeadTime_SemPrazos_RetornaZero() =>
        Assert.Equal(0, DashboardService.CalcularLeadTime([]));

    [Fact]
    public void CalcularLeadTime_ArredondaParaUmaCasa() =>
        Assert.Equal(1.3, DashboardService.CalcularLeadTime([
            (new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 2)),
            (new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 2)),
            (new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 3)),
        ]));

    [Fact]
    public async Task Obter_FaturamentoMensal_AgrupaPorMesEmOrdemCronologica()
    {
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 100m, fim: new DateOnly(2026, 2, 10));
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 50m, fim: new DateOnly(2026, 1, 5));
        NovaOrdem("Fiat", EtapaOrdem.Finalizada, 25m, fim: new DateOnly(2026, 1, 20));
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Equal(2, d.FaturamentoMensal.Count);
        Assert.Equal("Jan/2026", d.FaturamentoMensal[0].Mes);
        Assert.Equal(75m, d.FaturamentoMensal[0].Valor);
        Assert.Equal(2, d.FaturamentoMensal[0].Quantidade);
        Assert.Equal("Fev/2026", d.FaturamentoMensal[1].Mes);
    }

    [Fact]
    public async Task Obter_StatusDistribuicao_AgrupaPorEtapa()
    {
        NovaOrdem("Fiat", EtapaOrdem.Rascunho, 1m);
        NovaOrdem("Fiat", EtapaOrdem.Rascunho, 1m);
        NovaOrdem("Fiat", EtapaOrdem.Cancelada, 1m);
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Collection(d.StatusDistribuicao,
            s => { Assert.Equal("rascunho", s.Status); Assert.Equal(2, s.Quantidade); },
            s => { Assert.Equal("cancelada", s.Status); Assert.Equal(1, s.Quantidade); });
    }

    [Fact]
    public async Task Obter_TopMarcas_LimitaACincoOrdenadoPorVolume()
    {
        foreach (var (marca, qtd) in new[] { ("A", 1), ("B", 6), ("C", 5), ("D", 4), ("E", 3), ("F", 2) })
            for (var i = 0; i < qtd; i++) NovaOrdem(marca, EtapaOrdem.Rascunho, 1m);
        await _db.SaveChangesAsync();

        var d = await _service.ObterAsync();

        Assert.Equal(["B", "C", "D", "E", "F"], d.TopMarcas.Select(m => m.Marca));
        Assert.Equal(6, d.TopMarcas[0].TotalOS);
    }
}

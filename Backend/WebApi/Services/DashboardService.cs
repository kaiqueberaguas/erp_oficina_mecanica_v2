using System.Globalization;
using Microsoft.EntityFrameworkCore;
using WebApi.Models;
using WebApi.Presenters;

namespace WebApi.Services;

public class DashboardService(OficinaDbContext db) : IDashboardService
{
    private const int MesesNoGrafico = 12;
    private const int TamanhoTopMarcas = 5;
    private static readonly CultureInfo PtBr = new("pt-BR");

    public async Task<DashboardPresenter> ObterAsync()
    {
        var ordens = db.TbOrdensServicos.AsNoTracking();
        var finalizadas = ordens.Where(o => o.Etapa == EtapaOrdem.Finalizada);

        var totalOrdens = await ordens.CountAsync();
        var faturamentoTotal = await finalizadas.SumAsync(o => (decimal?)o.ValorServico) ?? 0m;
        var ticketMedio = await finalizadas.AverageAsync(o => (decimal?)o.ValorServico) ?? 0m;

        var prazos = await finalizadas
            .Where(o => o.DataFimServico != null)
            .Select(o => new { o.DataEntradaCarro, Fim = o.DataFimServico!.Value })
            .ToListAsync();
        var leadTime = CalcularLeadTime(prazos.Select(p => (p.DataEntradaCarro, p.Fim)));

        var status = (await ordens.GroupBy(o => o.Etapa)
                .Select(g => new { Etapa = g.Key, Quantidade = g.Count() })
                .ToListAsync())
            .OrderBy(g => g.Etapa)
            .Select(g => new StatusQuantidadePresenter(g.Etapa.ToString().ToLowerInvariant(), g.Quantidade))
            .ToList();

        var mensal = (await finalizadas
                .Where(o => o.DataFimServico != null)
                .GroupBy(o => new { o.DataFimServico!.Value.Year, o.DataFimServico!.Value.Month })
                .Select(g => new
                {
                    g.Key.Year,
                    g.Key.Month,
                    Valor = g.Sum(o => o.ValorServico),
                    Quantidade = g.Count(),
                })
                .ToListAsync())
            .OrderByDescending(g => g.Year).ThenByDescending(g => g.Month)
            .Take(MesesNoGrafico)
            .OrderBy(g => g.Year).ThenBy(g => g.Month)
            .Select(g => new FaturamentoMensalPresenter(
                RotuloMes(g.Year, g.Month), g.Valor, g.Quantidade))
            .ToList();

        var marcas = (await ordens.GroupBy(o => o.Carro.Marca)
                .Select(g => new { Marca = g.Key, Total = g.Count() })
                .OrderByDescending(g => g.Total).ThenBy(g => g.Marca)
                .Take(TamanhoTopMarcas)
                .ToListAsync())
            .Select(g => new MarcaTotalPresenter(g.Marca, g.Total))
            .ToList();

        return new DashboardPresenter(
            new DashboardKpisPresenter(faturamentoTotal, ticketMedio, leadTime, totalOrdens),
            status, mensal, marcas);
    }

    /// <summary>Média em dias entre a entrada do carro e o fim do serviço, com 1 casa decimal (0 se vazio).</summary>
    public static double CalcularLeadTime(IEnumerable<(DateOnly Entrada, DateOnly Fim)> prazos)
    {
        var dias = prazos.Select(p => p.Fim.DayNumber - p.Entrada.DayNumber).ToList();
        return dias.Count == 0 ? 0 : Math.Round(dias.Average(), 1);
    }

    private static string RotuloMes(int ano, int mes)
    {
        var abreviado = PtBr.DateTimeFormat.GetAbbreviatedMonthName(mes).TrimEnd('.');
        return $"{char.ToUpper(abreviado[0], PtBr)}{abreviado[1..]}/{ano}";
    }
}

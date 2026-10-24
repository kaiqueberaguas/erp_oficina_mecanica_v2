using Microsoft.EntityFrameworkCore;
using WebApi.Exceptions;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public class OrdemServicoService(OficinaDbContext db) : IOrdemServicoService
{
    public Task<PagedResultPresenter<OrdemServicoPresenter>> ListarAsync(
        IReadOnlyList<EtapaOrdem>? etapas, string? busca, DateOnly? dataInicial, DateOnly? dataFinal, int page, int pageSize)
    {
        var query = db.TbOrdensServicos.AsNoTracking();

        if (etapas is { Count: > 0 })
            query = query.Where(o => etapas.Contains(o.Etapa));

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var placa = Normalizacao.PlacaParaBusca(termo);
            var numero = int.TryParse(termo.TrimStart('#'), out var id) ? id : -1;
            query = query.Where(o => o.Id == numero
                || o.Carro.Placa.Contains(placa)
                || o.Carro.Cliente.Nome.Contains(termo));
        }

        if (dataInicial is not null)
            query = query.Where(o => o.DataEntradaCarro >= dataInicial);

        if (dataFinal is not null)
            query = query.Where(o => o.DataEntradaCarro <= dataFinal);

        return query.OrderByDescending(o => o.DataEntradaCarro).ThenByDescending(o => o.Id)
            .Select(o => new OrdemServicoPresenter(
                o.Id, o.CarroId, o.DescricaoOrdem, o.ValorServico, o.Etapa,
                o.DataEntradaCarro, o.DataInicioServico, o.DataFimServico, o.DataRetiradaVeiculo, o.Observacao,
                o.Carro.Placa, o.Carro.Marca, o.Carro.Modelo, o.Carro.Cliente.Nome))
            .PaginarAsync(page, pageSize);
    }

    public async Task<OrdemServicoDetalhePresenter> ObterAsync(int id)
    {
        var ordem = await db.TbOrdensServicos.AsNoTracking()
            .Include(o => o.Carro).ThenInclude(c => c.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NaoEncontradoException("Ordem de serviço não encontrada.");

        var cliente = ordem.Carro.Cliente;
        return new OrdemServicoDetalhePresenter(
            ParaPresenter(ordem),
            CarroService.ParaPresenter(ordem.Carro),
            new ClientePresenter(cliente.Id, cliente.Nome, cliente.Cpf, cliente.Contato));
    }

    public async Task<OrdemServicoPresenter> CriarAsync(OrdemServicoParameter parametro)
    {
        await GarantirCarroAsync(parametro.CarroId);

        var ordem = new TbOrdensServico
        {
            CarroId = parametro.CarroId,
            DescricaoOrdem = parametro.DescricaoOrdem.Trim(),
            ValorServico = parametro.ValorServico,
            Etapa = EtapaOrdem.Rascunho,
            DataEntradaCarro = parametro.DataEntradaCarro ?? Hoje(),
        };
        db.TbOrdensServicos.Add(ordem);
        await db.SaveChangesAsync();

        return ParaPresenter(ordem);
    }

    public async Task<OrdemServicoPresenter> AtualizarAsync(int id, OrdemServicoParameter parametro)
    {
        var ordem = await db.TbOrdensServicos.FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NaoEncontradoException("Ordem de serviço não encontrada.");

        await GarantirCarroAsync(parametro.CarroId);

        ordem.CarroId = parametro.CarroId;
        ordem.DescricaoOrdem = parametro.DescricaoOrdem.Trim();
        ordem.ValorServico = parametro.ValorServico;
        ordem.DataEntradaCarro = parametro.DataEntradaCarro ?? ordem.DataEntradaCarro;
        await db.SaveChangesAsync();

        await db.Entry(ordem).Reference(o => o.Carro).Query().Include(c => c.Cliente).LoadAsync();
        return ParaPresenter(ordem);
    }

    /// <summary>
    /// Só avança para etapa de número maior (pode pular). Datas: Início/Em andamento preenchem
    /// data_inicio_servico; Finalizada preenche data_fim_servico (e o início, se vazio).
    /// </summary>
    public async Task<OrdemServicoPresenter> AtualizarEtapaAsync(int id, AtualizarEtapaParameter parametro)
    {
        var ordem = await db.TbOrdensServicos
            .Include(o => o.Carro).ThenInclude(c => c.Cliente)
            .FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NaoEncontradoException("Ordem de serviço não encontrada.");

        var nova = parametro.Etapa!.Value;

        // Mesma etapa só é aceita para registrar a retirada do veículo (OS já finalizada/cancelada).
        if (nova == ordem.Etapa && parametro.DataRetiradaVeiculo is not null)
        {
            ordem.DataRetiradaVeiculo = parametro.DataRetiradaVeiculo;
            await db.SaveChangesAsync();
            return ParaPresenter(ordem);
        }

        if (!Enum.IsDefined(nova) || nova <= ordem.Etapa)
            throw new TransicaoEtapaInvalidaException(ordem.Etapa.ToString(), nova.ToString());

        var hoje = Hoje();
        switch (nova)
        {
            case EtapaOrdem.Inicio:
            case EtapaOrdem.EmAndamento:
                ordem.DataInicioServico ??= hoje;
                break;
            case EtapaOrdem.Finalizada:
                ordem.DataInicioServico ??= hoje;
                ordem.DataFimServico ??= hoje;
                break;
        }

        if (parametro.DataRetiradaVeiculo is not null)
            ordem.DataRetiradaVeiculo = parametro.DataRetiradaVeiculo;

        if (!string.IsNullOrWhiteSpace(parametro.Observacao))
            ordem.Observacao = parametro.Observacao.Trim();

        ordem.Etapa = nova;
        await db.SaveChangesAsync();

        return ParaPresenter(ordem);
    }

    public async Task ExcluirAsync(int id)
    {
        var ordem = await db.TbOrdensServicos.FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new NaoEncontradoException("Ordem de serviço não encontrada.");

        db.TbOrdensServicos.Remove(ordem);
        await db.SaveChangesAsync();
    }

    private async Task GarantirCarroAsync(int carroId)
    {
        if (!await db.TbCarros.AnyAsync(c => c.Id == carroId))
            throw new NaoEncontradoException("Carro não encontrado.");
    }

    private static DateOnly Hoje() => DateOnly.FromDateTime(DateTime.Today);

    internal static OrdemServicoPresenter ParaPresenter(TbOrdensServico o) => new(
        o.Id, o.CarroId, o.DescricaoOrdem, o.ValorServico, o.Etapa,
        o.DataEntradaCarro, o.DataInicioServico, o.DataFimServico, o.DataRetiradaVeiculo, o.Observacao,
        o.Carro?.Placa, o.Carro?.Marca, o.Carro?.Modelo, o.Carro?.Cliente?.Nome);
}

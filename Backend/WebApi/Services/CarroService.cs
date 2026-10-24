using Microsoft.EntityFrameworkCore;
using WebApi.Exceptions;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public class CarroService(OficinaDbContext db) : ICarroService
{
    public Task<PagedResultPresenter<CarroPresenter>> ListarAsync(string? busca, int? clienteId, int page, int pageSize)
    {
        var query = db.TbCarros.AsNoTracking();

        if (clienteId is not null)
            query = query.Where(c => c.ClienteId == clienteId);

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var placa = Normalizacao.PlacaParaBusca(termo);
            query = query.Where(c => c.Placa.Contains(placa) || c.Modelo.Contains(termo)
                || c.Marca.Contains(termo) || c.Cliente.Nome.Contains(termo));
        }

        return query.OrderBy(c => c.Placa).ThenBy(c => c.Id)
            .Select(c => new CarroPresenter(c.Id, c.ClienteId, c.Marca, c.Modelo, c.Placa,
                c.TbOrdensServicos.Count, c.Cliente.Nome))
            .PaginarAsync(page, pageSize);
    }

    public async Task<CarroDetalhePresenter> ObterAsync(int id)
    {
        var carro = await db.TbCarros.AsNoTracking()
            .Include(c => c.TbOrdensServicos)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Carro não encontrado.");

        return new CarroDetalhePresenter(
            carro.Id, carro.ClienteId, carro.Marca, carro.Modelo, carro.Placa,
            carro.TbOrdensServicos.OrderByDescending(o => o.DataEntradaCarro).ThenByDescending(o => o.Id)
                .Select(OrdemServicoService.ParaPresenter).ToList());
    }

    public async Task<CarroPresenter> CriarAsync(CarroParameter parametro)
    {
        var placa = Normalizacao.Placa(parametro.Placa);
        await GarantirClienteAsync(parametro.ClienteId);

        if (await db.TbCarros.AnyAsync(c => c.Placa == placa))
            throw new PlacaDuplicadaException();

        var carro = new TbCarro
        {
            ClienteId = parametro.ClienteId,
            Marca = parametro.Marca.Trim(),
            Modelo = parametro.Modelo.Trim(),
            Placa = placa,
        };
        db.TbCarros.Add(carro);
        await db.SaveChangesAsync();

        return ParaPresenter(carro);
    }

    public async Task<CarroPresenter> AtualizarAsync(int id, CarroParameter parametro)
    {
        var carro = await db.TbCarros.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Carro não encontrado.");

        var placa = Normalizacao.Placa(parametro.Placa);
        await GarantirClienteAsync(parametro.ClienteId);

        if (await db.TbCarros.AnyAsync(c => c.Placa == placa && c.Id != id))
            throw new PlacaDuplicadaException();

        carro.ClienteId = parametro.ClienteId;
        carro.Marca = parametro.Marca.Trim();
        carro.Modelo = parametro.Modelo.Trim();
        carro.Placa = placa;
        await db.SaveChangesAsync();

        return ParaPresenter(carro);
    }

    public async Task ExcluirAsync(int id)
    {
        var carro = await db.TbCarros.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Carro não encontrado.");

        db.TbCarros.Remove(carro);
        await db.SaveChangesAsync();
    }

    private async Task GarantirClienteAsync(int clienteId)
    {
        if (!await db.TbClientes.AnyAsync(c => c.Id == clienteId))
            throw new NaoEncontradoException("Cliente não encontrado.");
    }

    internal static CarroPresenter ParaPresenter(TbCarro c) => new(c.Id, c.ClienteId, c.Marca, c.Modelo, c.Placa);
}

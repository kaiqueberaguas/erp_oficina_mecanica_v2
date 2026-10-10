using Microsoft.EntityFrameworkCore;
using WebApi.Exceptions;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public class ClienteService(OficinaDbContext db) : IClienteService
{
    public Task<PagedResultPresenter<ClientePresenter>> ListarAsync(string? busca, int page, int pageSize)
    {
        var query = db.TbClientes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var digitos = Normalizacao.SomenteDigitos(termo);
            query = digitos.Length > 0
                ? query.Where(c => c.Nome.Contains(termo) || c.Cpf.Contains(digitos))
                : query.Where(c => c.Nome.Contains(termo));
        }

        return query.OrderBy(c => c.Nome).ThenBy(c => c.Id).PaginarAsync(page, pageSize, ParaPresenter);
    }

    public async Task<ClienteDetalhePresenter> ObterAsync(int id)
    {
        var cliente = await db.TbClientes.AsNoTracking()
            .Include(c => c.TbCarros)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Cliente não encontrado.");

        return new ClienteDetalhePresenter(
            cliente.Id, cliente.Nome, cliente.Cpf, cliente.Contato,
            cliente.TbCarros.OrderBy(c => c.Id)
                .Select(c => new CarroResumoPresenter(c.Id, c.Marca, c.Modelo, c.Placa)).ToList());
    }

    public async Task<ClientePresenter> CriarAsync(ClienteParameter parametro)
    {
        var cpf = Normalizacao.Cpf(parametro.Cpf);

        if (await db.TbClientes.AnyAsync(c => c.Cpf == cpf))
            throw new CpfDuplicadoException();

        var cliente = new TbCliente { Nome = parametro.Nome.Trim(), Cpf = cpf, Contato = parametro.Contato.Trim() };
        db.TbClientes.Add(cliente);
        await db.SaveChangesAsync();

        return ParaPresenter(cliente);
    }

    public async Task<ClientePresenter> AtualizarAsync(int id, ClienteParameter parametro)
    {
        var cliente = await db.TbClientes.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Cliente não encontrado.");

        var cpf = Normalizacao.Cpf(parametro.Cpf);

        if (await db.TbClientes.AnyAsync(c => c.Cpf == cpf && c.Id != id))
            throw new CpfDuplicadoException();

        cliente.Nome = parametro.Nome.Trim();
        cliente.Cpf = cpf;
        cliente.Contato = parametro.Contato.Trim();
        await db.SaveChangesAsync();

        return ParaPresenter(cliente);
    }

    public async Task ExcluirAsync(int id)
    {
        var cliente = await db.TbClientes.FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new NaoEncontradoException("Cliente não encontrado.");

        db.TbClientes.Remove(cliente);
        await db.SaveChangesAsync();
    }

    private static ClientePresenter ParaPresenter(TbCliente c) => new(c.Id, c.Nome, c.Cpf, c.Contato);
}

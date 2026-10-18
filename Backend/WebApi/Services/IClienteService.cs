using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public interface IClienteService
{
    Task<PagedResultPresenter<ClientePresenter>> ListarAsync(string? busca, int page, int pageSize);
    Task<ClienteDetalhePresenter> ObterAsync(int id);
    Task<ClientePresenter> CriarAsync(ClienteParameter parametro);
    Task<ClientePresenter> AtualizarAsync(int id, ClienteParameter parametro);
    Task ExcluirAsync(int id);
}

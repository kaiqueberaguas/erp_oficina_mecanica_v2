using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public interface ICarroService
{
    Task<PagedResultPresenter<CarroPresenter>> ListarAsync(string? busca, int? clienteId, int page, int pageSize);
    Task<CarroDetalhePresenter> ObterAsync(int id);
    Task<CarroPresenter> CriarAsync(CarroParameter parametro);
    Task<CarroPresenter> AtualizarAsync(int id, CarroParameter parametro);
    Task ExcluirAsync(int id);
}

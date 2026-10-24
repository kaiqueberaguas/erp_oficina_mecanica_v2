using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Services;

public interface IOrdemServicoService
{
    Task<PagedResultPresenter<OrdemServicoPresenter>> ListarAsync(
        IReadOnlyList<EtapaOrdem>? etapas, string? busca, DateOnly? dataInicial, DateOnly? dataFinal, int page, int pageSize);
    Task<OrdemServicoDetalhePresenter> ObterAsync(int id);
    Task<OrdemServicoPresenter> CriarAsync(OrdemServicoParameter parametro);
    Task<OrdemServicoPresenter> AtualizarAsync(int id, OrdemServicoParameter parametro);
    Task<OrdemServicoPresenter> AtualizarEtapaAsync(int id, AtualizarEtapaParameter parametro);
    Task ExcluirAsync(int id);
}

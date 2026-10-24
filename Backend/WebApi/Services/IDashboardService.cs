using WebApi.Presenters;

namespace WebApi.Services;

public interface IDashboardService
{
    Task<DashboardPresenter> ObterAsync();
}

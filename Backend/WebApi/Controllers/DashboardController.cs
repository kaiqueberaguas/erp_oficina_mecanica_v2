using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Presenters;
using WebApi.Services;

namespace WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/dashboard")]
public class DashboardController(IDashboardService dashboard) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardPresenter>> Obter() => Ok(await dashboard.ObterAsync());
}

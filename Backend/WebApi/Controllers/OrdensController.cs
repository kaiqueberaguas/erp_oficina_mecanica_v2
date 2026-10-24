using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;
using WebApi.Services;

namespace WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/ordens")]
public class OrdensController(IOrdemServicoService ordens) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResultPresenter<OrdemServicoPresenter>>> Listar(
        [FromQuery] EtapaOrdem[]? etapa, [FromQuery] string? busca,
        [FromQuery] DateOnly? dataInicial, [FromQuery] DateOnly? dataFinal,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        Ok(await ordens.ListarAsync(etapa, busca, dataInicial, dataFinal, page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrdemServicoDetalhePresenter>> Obter(int id) =>
        Ok(await ordens.ObterAsync(id));

    [HttpPost]
    public async Task<ActionResult<OrdemServicoPresenter>> Criar(OrdemServicoParameter parametro)
    {
        var ordem = await ordens.CriarAsync(parametro);
        return Created($"/api/v1/ordens/{ordem.Id}", ordem);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<OrdemServicoPresenter>> Atualizar(int id, OrdemServicoParameter parametro) =>
        Ok(await ordens.AtualizarAsync(id, parametro));

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrdemServicoPresenter>> AtualizarEtapa(int id, AtualizarEtapaParameter parametro) =>
        Ok(await ordens.AtualizarEtapaAsync(id, parametro));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        await ordens.ExcluirAsync(id);
        return NoContent();
    }
}

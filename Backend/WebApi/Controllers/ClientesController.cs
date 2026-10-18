using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Parameters;
using WebApi.Presenters;
using WebApi.Services;

namespace WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/clientes")]
public class ClientesController(IClienteService clientes) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResultPresenter<ClientePresenter>>> Listar(
        [FromQuery] string? busca, [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        Ok(await clientes.ListarAsync(busca, page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDetalhePresenter>> Obter(int id) =>
        Ok(await clientes.ObterAsync(id));

    [HttpPost]
    public async Task<ActionResult<ClientePresenter>> Criar(ClienteParameter parametro)
    {
        var cliente = await clientes.CriarAsync(parametro);
        return Created($"/api/v1/clientes/{cliente.Id}", cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClientePresenter>> Atualizar(int id, ClienteParameter parametro) =>
        Ok(await clientes.AtualizarAsync(id, parametro));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        await clientes.ExcluirAsync(id);
        return NoContent();
    }
}

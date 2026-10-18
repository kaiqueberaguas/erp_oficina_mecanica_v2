using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.Parameters;
using WebApi.Presenters;
using WebApi.Services;

namespace WebApi.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/carros")]
public class CarrosController(ICarroService carros) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResultPresenter<CarroPresenter>>> Listar(
        [FromQuery] string? busca, [FromQuery] int? clienteId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10) =>
        Ok(await carros.ListarAsync(busca, clienteId, page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CarroDetalhePresenter>> Obter(int id) =>
        Ok(await carros.ObterAsync(id));

    [HttpPost]
    public async Task<ActionResult<CarroPresenter>> Criar(CarroParameter parametro)
    {
        var carro = await carros.CriarAsync(parametro);
        return Created($"/api/v1/carros/{carro.Id}", carro);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CarroPresenter>> Atualizar(int id, CarroParameter parametro) =>
        Ok(await carros.AtualizarAsync(id, parametro));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Excluir(int id)
    {
        await carros.ExcluirAsync(id);
        return NoContent();
    }
}

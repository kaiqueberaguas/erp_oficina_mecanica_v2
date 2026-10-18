using System.Net;
using System.Net.Http.Json;
using WebApi.Parameters;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class CarrosEndpointsTests(AuthApiFactory factory)
    : IntegrationTestBase(factory), IClassFixture<AuthApiFactory>
{
    [Fact]
    public async Task Listar_SemToken_Retorna401()
    {
        var resposta = await Anonimo.GetAsync("/api/v1/carros");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Criar_ClienteInexistente_Retorna404_PlacaDuplicada_Retorna409()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);
        var carro = await CriarCarroAsync(client, cliente.Id);

        var semCliente = await client.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = 999999999, Marca = "A", Modelo = "B", Placa = PlacaAleatoria() });
        var duplicada = await client.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = cliente.Id, Marca = "A", Modelo = "B", Placa = carro.Placa });

        Assert.Equal(HttpStatusCode.NotFound, semCliente.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, duplicada.StatusCode);
    }

    [Fact]
    public async Task Criar_PlacaInvalida_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);

        var r = await client.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = cliente.Id, Marca = "A", Modelo = "B", Placa = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }
}

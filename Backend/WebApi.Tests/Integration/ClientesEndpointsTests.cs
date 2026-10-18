using System.Net;
using System.Net.Http.Json;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class ClientesEndpointsTests(AuthApiFactory factory)
    : IntegrationTestBase(factory), IClassFixture<AuthApiFactory>
{
    [Fact]
    public async Task Listar_SemToken_Retorna401()
    {
        var resposta = await Anonimo.GetAsync("/api/v1/clientes");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Criar_ComMascara_SalvaSomenteDigitos()
    {
        var client = await ClienteAutenticadoAsync();

        var cliente = await CriarClienteAsync(client);

        Assert.Equal(11, cliente.Cpf.Length);
        Assert.All(cliente.Cpf, ch => Assert.True(char.IsDigit(ch)));
    }

    [Fact]
    public async Task Criar_CpfDuplicado_Retorna409()
    {
        var client = await ClienteAutenticadoAsync();
        var cpf = CpfAleatorio();
        await CriarClienteAsync(client, cpf);

        var r = await client.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "Outro", Cpf = cpf, Contato = "x" });

        Assert.Equal(HttpStatusCode.Conflict, r.StatusCode);
    }

    [Fact]
    public async Task Criar_CpfInvalidoOuCamposVazios_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();

        var invalido = await client.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "X", Cpf = "111.111.111-11", Contato = "x" });
        var vazio = await client.PostAsJsonAsync("/api/v1/clientes", new ClienteParameter());

        Assert.Equal(HttpStatusCode.BadRequest, invalido.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, vazio.StatusCode);
    }

    [Fact]
    public async Task Obter_Inexistente_Retorna404()
    {
        var client = await ClienteAutenticadoAsync();

        var r = await client.GetAsync("/api/v1/clientes/999999999");

        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
    }

    [Fact]
    public async Task Listar_RetornaEnvelopePaginado()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);

        var pagina = await client.GetFromJsonAsync<PagedResultPresenter<ClientePresenter>>(
            $"/api/v1/clientes?busca={cliente.Cpf}&page=1&pageSize=5");

        Assert.Equal(1, pagina!.Page);
        Assert.Equal(5, pagina.PageSize);
        Assert.Contains(pagina.Items, c => c.Id == cliente.Id);
    }
}

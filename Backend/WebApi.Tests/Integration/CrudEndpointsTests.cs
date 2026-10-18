using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using WebApi.DTOs;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class CrudEndpointsTests(AuthApiFactory factory) : IClassFixture<AuthApiFactory>
{
    private readonly HttpClient _anonimo = factory.CreateClient();

    private async Task<HttpClient> ClienteAutenticadoAsync()
    {
        var client = factory.CreateClient();
        var registro = new RegisterRequest
        {
            Nome = "Crud", Login = $"crud-{Guid.NewGuid():N}@oficina.com", Senha = "Senha@123",
        };
        await client.PostAsJsonAsync("/api/v1/auth/register", registro);
        var login = await client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest { Login = registro.Login, Senha = registro.Senha });
        var auth = await login.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);
        return client;
    }

    private static string CpfAleatorio()
    {
        var d = Enumerable.Range(0, 9).Select(_ => Random.Shared.Next(10)).ToList();
        if (d.Distinct().Count() == 1) d[0] = (d[0] + 1) % 10;
        for (var n = 9; n <= 10; n++)
        {
            var soma = 0;
            for (var i = 0; i < n; i++) soma += d[i] * (n + 1 - i);
            var r = soma * 10 % 11;
            d.Add(r == 10 ? 0 : r);
        }
        var s = string.Concat(d);
        return $"{s[..3]}.{s[3..6]}.{s[6..9]}-{s[9..]}";
    }

    private static string PlacaAleatoria() =>
        $"{(char)('A' + Random.Shared.Next(26))}{(char)('A' + Random.Shared.Next(26))}{(char)('A' + Random.Shared.Next(26))}{Random.Shared.Next(1000, 9999)}";

    private static async Task<ClientePresenter> CriarClienteAsync(HttpClient c, string? cpf = null)
    {
        var r = await c.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "Cliente Teste", Cpf = cpf ?? CpfAleatorio(), Contato = "11999990000" });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await r.Content.ReadFromJsonAsync<ClientePresenter>())!;
    }

    private static async Task<CarroPresenter> CriarCarroAsync(HttpClient c, int clienteId)
    {
        var r = await c.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = clienteId, Marca = "Fiat", Modelo = "Uno", Placa = PlacaAleatoria() });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await r.Content.ReadFromJsonAsync<CarroPresenter>())!;
    }

    [Theory]
    [InlineData("/api/v1/clientes")]
    [InlineData("/api/v1/carros")]
    [InlineData("/api/v1/ordens")]
    public async Task Listar_SemToken_Retorna401(string rota)
    {
        var resposta = await _anonimo.GetAsync(rota);

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Cliente_CriarComMascara_SalvaSomenteDigitos()
    {
        var client = await ClienteAutenticadoAsync();

        var cliente = await CriarClienteAsync(client);

        Assert.Equal(11, cliente.Cpf.Length);
        Assert.All(cliente.Cpf, ch => Assert.True(char.IsDigit(ch)));
    }

    [Fact]
    public async Task Cliente_CpfDuplicado_Retorna409()
    {
        var client = await ClienteAutenticadoAsync();
        var cpf = CpfAleatorio();
        await CriarClienteAsync(client, cpf);

        var r = await client.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "Outro", Cpf = cpf, Contato = "x" });

        Assert.Equal(HttpStatusCode.Conflict, r.StatusCode);
    }

    [Fact]
    public async Task Cliente_CpfInvalidoOuCamposVazios_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();

        var invalido = await client.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "X", Cpf = "111.111.111-11", Contato = "x" });
        var vazio = await client.PostAsJsonAsync("/api/v1/clientes", new ClienteParameter());

        Assert.Equal(HttpStatusCode.BadRequest, invalido.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, vazio.StatusCode);
    }

    [Fact]
    public async Task Cliente_ObterInexistente_Retorna404()
    {
        var client = await ClienteAutenticadoAsync();

        var r = await client.GetAsync("/api/v1/clientes/999999999");

        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
    }

    [Fact]
    public async Task Cliente_Listar_RetornaEnvelopePaginado()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);

        var pagina = await client.GetFromJsonAsync<PagedResultPresenter<ClientePresenter>>(
            $"/api/v1/clientes?busca={cliente.Cpf}&page=1&pageSize=5");

        Assert.Equal(1, pagina!.Page);
        Assert.Equal(5, pagina.PageSize);
        Assert.Contains(pagina.Items, c => c.Id == cliente.Id);
    }

    [Fact]
    public async Task Carro_ClienteInexistente_Retorna404_PlacaDuplicada_Retorna409()
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
    public async Task Carro_PlacaInvalida_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);

        var r = await client.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = cliente.Id, Marca = "A", Modelo = "B", Placa = "123" });

        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Ordem_FluxoCompleto_EtapasDatasECascade()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);
        var carro = await CriarCarroAsync(client, cliente.Id);

        var criada = await client.PostAsJsonAsync("/api/v1/ordens",
            new OrdemServicoParameter { CarroId = carro.Id, DescricaoOrdem = "Revisão", ValorServico = 300 });
        Assert.Equal(HttpStatusCode.Created, criada.StatusCode);
        var ordem = (await criada.Content.ReadFromJsonAsync<OrdemServicoPresenter>())!;
        Assert.Equal(EtapaOrdem.Rascunho, ordem.Etapa);

        var emAndamento = await client.PatchAsJsonAsync($"/api/v1/ordens/{ordem.Id}/status",
            new AtualizarEtapaParameter { Etapa = EtapaOrdem.EmAndamento });
        Assert.Equal(HttpStatusCode.OK, emAndamento.StatusCode);
        var andamento = (await emAndamento.Content.ReadFromJsonAsync<OrdemServicoPresenter>())!;
        Assert.NotNull(andamento.DataInicioServico);

        var retrocesso = await client.PatchAsJsonAsync($"/api/v1/ordens/{ordem.Id}/status",
            new AtualizarEtapaParameter { Etapa = EtapaOrdem.Inicio });
        Assert.Equal(HttpStatusCode.BadRequest, retrocesso.StatusCode);

        var cancelada = await client.PatchAsJsonAsync($"/api/v1/ordens/{ordem.Id}/status",
            new AtualizarEtapaParameter { Etapa = EtapaOrdem.Cancelada });
        Assert.Equal(HttpStatusCode.OK, cancelada.StatusCode);

        var detalhe = await client.GetFromJsonAsync<OrdemServicoDetalhePresenter>($"/api/v1/ordens/{ordem.Id}");
        Assert.Equal(carro.Placa, detalhe!.Carro.Placa);
        Assert.Equal(cliente.Id, detalhe.Cliente.Id);

        var filtrada = await client.GetFromJsonAsync<PagedResultPresenter<OrdemServicoPresenter>>(
            $"/api/v1/ordens?etapa=Cancelada&placa={carro.Placa}");
        Assert.Contains(filtrada!.Items, o => o.Id == ordem.Id);

        // Excluir o cliente remove carros e ordens (ON DELETE CASCADE).
        var del = await client.DeleteAsync($"/api/v1/clientes/{cliente.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/ordens/{ordem.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/carros/{carro.Id}")).StatusCode);
    }

    [Fact]
    public async Task Ordem_CarroInexistente_Retorna404_DescricaoVazia_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();

        var semCarro = await client.PostAsJsonAsync("/api/v1/ordens",
            new OrdemServicoParameter { CarroId = 999999999, DescricaoOrdem = "x", ValorServico = 1 });
        var invalida = await client.PostAsJsonAsync("/api/v1/ordens", new OrdemServicoParameter { CarroId = 1 });

        Assert.Equal(HttpStatusCode.NotFound, semCarro.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalida.StatusCode);
    }
}

using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using WebApi.DTOs;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Tests.Integration;

/// <summary>Helpers compartilhados pelos testes integrados dos controllers CRUD.</summary>
[Trait("Category", "Integration")]
public abstract class IntegrationTestBase(AuthApiFactory factory)
{
    protected readonly HttpClient Anonimo = factory.CreateClient();

    protected async Task<HttpClient> ClienteAutenticadoAsync()
    {
        var client = factory.CreateClient();
        var registro = new RegisterRequest
        {
            Nome = "Crud",
            Login = $"crud-{Guid.NewGuid():N}@oficina.com",
            Senha = "Senha@123",
        };
        await client.PostAsJsonAsync("/api/v1/auth/register", registro);
        var login = await client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest { Login = registro.Login, Senha = registro.Senha });
        var auth = await login.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);
        return client;
    }

    protected static string CpfAleatorio()
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

    protected static string PlacaAleatoria() =>
        $"{(char)('A' + Random.Shared.Next(26))}{(char)('A' + Random.Shared.Next(26))}{(char)('A' + Random.Shared.Next(26))}{Random.Shared.Next(1000, 9999)}";

    protected static async Task<ClientePresenter> CriarClienteAsync(HttpClient c, string? cpf = null)
    {
        var r = await c.PostAsJsonAsync("/api/v1/clientes",
            new ClienteParameter { Nome = "Cliente Teste", Cpf = cpf ?? CpfAleatorio(), Contato = "11999990000" });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await r.Content.ReadFromJsonAsync<ClientePresenter>())!;
    }

    protected static async Task<CarroPresenter> CriarCarroAsync(HttpClient c, int clienteId)
    {
        var r = await c.PostAsJsonAsync("/api/v1/carros",
            new CarroParameter { ClienteId = clienteId, Marca = "Fiat", Modelo = "Uno", Placa = PlacaAleatoria() });
        Assert.Equal(HttpStatusCode.Created, r.StatusCode);
        return (await r.Content.ReadFromJsonAsync<CarroPresenter>())!;
    }
}

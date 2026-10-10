using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using WebApi.DTOs;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class AuthEndpointsTests(AuthApiFactory factory) : IClassFixture<AuthApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static RegisterRequest NovoUsuario() => new()
    {
        Nome = "Usuário de Teste",
        Login = $"teste-{Guid.NewGuid():N}@oficina.com",
        Senha = "Senha@123",
    };

    [Fact]
    public async Task Register_DadosValidos_Retorna201()
    {
        var resposta = await _client.PostAsJsonAsync("/api/v1/auth/register", NovoUsuario());

        Assert.Equal(HttpStatusCode.Created, resposta.StatusCode);
    }

    [Fact]
    public async Task Register_LoginDuplicado_Retorna400()
    {
        var request = NovoUsuario();
        await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        var resposta = await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        Assert.Equal(HttpStatusCode.BadRequest, resposta.StatusCode);
    }

    [Fact]
    public async Task Login_CredenciaisCorretas_Retorna200ComToken()
    {
        var request = NovoUsuario();
        await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        var resposta = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest { Login = request.Login, Senha = request.Senha });

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var corpo = await resposta.Content.ReadFromJsonAsync<AuthResponse>();
        Assert.False(string.IsNullOrWhiteSpace(corpo?.Token));
    }

    [Fact]
    public async Task Login_SenhaIncorreta_Retorna401()
    {
        var request = NovoUsuario();
        await _client.PostAsJsonAsync("/api/v1/auth/register", request);

        var resposta = await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest { Login = request.Login, Senha = "senha-errada" });

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Me_SemToken_Retorna401()
    {
        var resposta = await _client.GetAsync("/api/v1/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Me_ComToken_RetornaDadosDoUsuario()
    {
        var request = NovoUsuario();
        await _client.PostAsJsonAsync("/api/v1/auth/register", request);
        var login = await (await _client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest { Login = request.Login, Senha = request.Senha }))
            .Content.ReadFromJsonAsync<AuthResponse>();

        var mensagem = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        mensagem.Headers.Authorization = new AuthenticationHeaderValue("Bearer", login!.Token);
        var resposta = await _client.SendAsync(mensagem);

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        var usuario = await resposta.Content.ReadFromJsonAsync<UsuarioDto>();
        Assert.Equal(request.Login, usuario!.Login);
    }
}

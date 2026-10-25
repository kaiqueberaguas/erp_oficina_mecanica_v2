using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class DashboardEndpointsTests(AuthApiFactory factory)
    : IntegrationTestBase(factory), IClassFixture<AuthApiFactory>
{
    [Fact]
    public async Task Obter_SemToken_Retorna401()
    {
        var resposta = await Anonimo.GetAsync("/api/v1/dashboard");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task Obter_RetornaEstruturaDoContrato()
    {
        var client = await ClienteAutenticadoAsync();
        var cliente = await CriarClienteAsync(client);
        var carro = await CriarCarroAsync(client, cliente.Id);
        var criada = await client.PostAsJsonAsync("/api/v1/ordens",
            new OrdemServicoParameter { CarroId = carro.Id, DescricaoOrdem = "Revisão", ValorServico = 300 });
        var ordem = (await criada.Content.ReadFromJsonAsync<OrdemServicoPresenter>())!;
        var finalizada = await client.PatchAsJsonAsync($"/api/v1/ordens/{ordem.Id}/status",
            new AtualizarEtapaParameter { Etapa = EtapaOrdem.Finalizada });
        Assert.Equal(HttpStatusCode.OK, finalizada.StatusCode);

        var resposta = await client.GetAsync("/api/v1/dashboard");

        Assert.Equal(HttpStatusCode.OK, resposta.StatusCode);
        using var json = JsonDocument.Parse(await resposta.Content.ReadAsStringAsync());
        var raiz = json.RootElement;
        var kpis = raiz.GetProperty("kpis");
        foreach (var campo in new[] { "faturamentoTotal", "ticketMedio", "tempoMedioReparoDias", "totalOrdens" })
            Assert.True(kpis.TryGetProperty(campo, out _), $"kpis.{campo} ausente");

        Assert.True(kpis.GetProperty("faturamentoTotal").GetDecimal() >= 300);
        Assert.True(kpis.GetProperty("totalOrdens").GetInt32() >= 1);

        var status = raiz.GetProperty("statusDistribuicao").EnumerateArray().ToList();
        Assert.Contains(status, s => s.GetProperty("status").GetString() == "finalizada"
            && s.GetProperty("quantidade").GetInt32() >= 1);
        Assert.Equal(kpis.GetProperty("totalOrdens").GetInt32(),
            status.Sum(s => s.GetProperty("quantidade").GetInt32()));

        Assert.NotEmpty(raiz.GetProperty("faturamentoMensal").EnumerateArray());
        var marcas = raiz.GetProperty("topMarcas").EnumerateArray().ToList();
        Assert.InRange(marcas.Count, 1, 5);
        Assert.True(marcas[0].TryGetProperty("marca", out _));
        Assert.True(marcas[0].TryGetProperty("totalOS", out _));
    }
}

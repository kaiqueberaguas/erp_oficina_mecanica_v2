using System.Net;
using System.Net.Http.Json;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Presenters;

namespace WebApi.Tests.Integration;

[Trait("Category", "Integration")]
public class OrdensEndpointsTests(AuthApiFactory factory)
    : IntegrationTestBase(factory), IClassFixture<AuthApiFactory>
{
    [Fact]
    public async Task Listar_SemToken_Retorna401()
    {
        var resposta = await Anonimo.GetAsync("/api/v1/ordens");

        Assert.Equal(HttpStatusCode.Unauthorized, resposta.StatusCode);
    }

    [Fact]
    public async Task FluxoCompleto_EtapasDatasECascade()
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
            $"/api/v1/ordens?etapa=Cancelada&busca={carro.Placa}");
        Assert.Contains(filtrada!.Items, o => o.Id == ordem.Id);

        // Excluir o cliente remove carros e ordens (ON DELETE CASCADE).
        var del = await client.DeleteAsync($"/api/v1/clientes/{cliente.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/ordens/{ordem.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/carros/{carro.Id}")).StatusCode);
    }

    [Fact]
    public async Task Criar_CarroInexistente_Retorna404_DescricaoVazia_Retorna400()
    {
        var client = await ClienteAutenticadoAsync();

        var semCarro = await client.PostAsJsonAsync("/api/v1/ordens",
            new OrdemServicoParameter { CarroId = 999999999, DescricaoOrdem = "x", ValorServico = 1 });
        var invalida = await client.PostAsJsonAsync("/api/v1/ordens", new OrdemServicoParameter { CarroId = 1 });

        Assert.Equal(HttpStatusCode.NotFound, semCarro.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalida.StatusCode);
    }
}

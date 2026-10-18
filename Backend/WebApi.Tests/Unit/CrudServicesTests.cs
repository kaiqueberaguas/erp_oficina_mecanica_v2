using Microsoft.EntityFrameworkCore;
using WebApi.Exceptions;
using WebApi.Models;
using WebApi.Parameters;
using WebApi.Services;

namespace WebApi.Tests.Unit;

[Trait("Category", "Unit")]
public class ClienteServiceTests
{
    private readonly OficinaDbContext _db = DbFactory.Criar();
    private readonly ClienteService _service;

    public ClienteServiceTests() => _service = new ClienteService(_db);

    private static ClienteParameter Param(string cpf = "529.982.247-25", string nome = " Ana ") =>
        new() { Nome = nome, Cpf = cpf, Contato = "11999990000" };

    [Fact]
    public async Task Criar_CpfComMascara_GravaSomenteDigitos()
    {
        var cliente = await _service.CriarAsync(Param());

        Assert.Equal("52998224725", cliente.Cpf);
        Assert.Equal("Ana", cliente.Nome);
        Assert.Equal("52998224725", (await _db.TbClientes.SingleAsync()).Cpf);
    }

    [Fact]
    public async Task Criar_CpfSemMascara_Aceita()
    {
        var cliente = await _service.CriarAsync(Param("52998224725"));

        Assert.Equal("52998224725", cliente.Cpf);
    }

    [Theory]
    [InlineData("111.111.111-11")]
    [InlineData("529.982.247-24")]
    [InlineData("123")]
    public async Task Criar_CpfInvalido_LancaCpfInvalido(string cpf) =>
        await Assert.ThrowsAsync<CpfInvalidoException>(() => _service.CriarAsync(Param(cpf)));

    [Fact]
    public async Task Criar_CpfDuplicadoComOutraMascara_LancaCpfDuplicado()
    {
        await _service.CriarAsync(Param("529.982.247-25"));

        await Assert.ThrowsAsync<CpfDuplicadoException>(() => _service.CriarAsync(Param("52998224725")));
    }

    [Fact]
    public async Task Atualizar_CpfDeOutroCliente_LancaCpfDuplicado()
    {
        await _service.CriarAsync(Param("529.982.247-25"));
        var outro = await _service.CriarAsync(Param("111.444.777-35", "Bia"));

        await Assert.ThrowsAsync<CpfDuplicadoException>(() => _service.AtualizarAsync(outro.Id, Param("529.982.247-25")));
    }

    [Fact]
    public async Task Atualizar_MesmoCpf_Permite()
    {
        var c = await _service.CriarAsync(Param());

        var atualizado = await _service.AtualizarAsync(c.Id, Param(nome: "Ana Maria"));

        Assert.Equal("Ana Maria", atualizado.Nome);
    }

    [Fact]
    public async Task Obter_Inexistente_LancaNaoEncontrado() =>
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.ObterAsync(99));

    [Fact]
    public async Task Listar_FiltraPorNomeECpfEPagina()
    {
        await _service.CriarAsync(Param("529.982.247-25", "Ana"));
        await _service.CriarAsync(Param("111.444.777-35", "Bruno"));

        var porNome = await _service.ListarAsync("Bru", 1, 10);
        var porCpf = await _service.ListarAsync("529.982", 1, 10);
        var paginado = await _service.ListarAsync(null, 2, 1);

        Assert.Equal("Bruno", Assert.Single(porNome.Items).Nome);
        Assert.Equal("Ana", Assert.Single(porCpf.Items).Nome);
        Assert.Equal(2, paginado.Total);
        Assert.Equal("Bruno", Assert.Single(paginado.Items).Nome);
    }

    [Fact]
    public async Task Excluir_Existente_Remove()
    {
        var c = await _service.CriarAsync(Param());

        await _service.ExcluirAsync(c.Id);

        Assert.Empty(_db.TbClientes);
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.ExcluirAsync(c.Id));
    }
}

[Trait("Category", "Unit")]
public class CarroServiceTests
{
    private readonly OficinaDbContext _db = DbFactory.Criar();
    private readonly CarroService _service;

    public CarroServiceTests() => _service = new CarroService(_db);

    private async Task<int> NovoClienteAsync()
    {
        var cliente = new TbCliente { Nome = "Ana", Cpf = Guid.NewGuid().ToString("N")[..11], Contato = "x" };
        _db.TbClientes.Add(cliente);
        await _db.SaveChangesAsync();
        return cliente.Id;
    }

    private static CarroParameter Param(int clienteId, string placa = "abc-1234") =>
        new() { ClienteId = clienteId, Marca = "Fiat", Modelo = "Uno", Placa = placa };

    [Theory]
    [InlineData("abc-1234", "ABC1234")]
    [InlineData("abc1d23", "ABC1D23")]
    public async Task Criar_PlacaValida_NormalizaMaiusculaSemHifen(string entrada, string esperado)
    {
        var carro = await _service.CriarAsync(Param(await NovoClienteAsync(), entrada));

        Assert.Equal(esperado, carro.Placa);
    }

    [Theory]
    [InlineData("AB-12345")]
    [InlineData("1234567")]
    public async Task Criar_PlacaInvalida_Lanca(string placa) =>
        await Assert.ThrowsAsync<PlacaInvalidaException>(async () =>
            await _service.CriarAsync(Param(await NovoClienteAsync(), placa)));

    [Fact]
    public async Task Criar_ClienteInexistente_LancaNaoEncontrado() =>
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.CriarAsync(Param(999)));

    [Fact]
    public async Task Criar_PlacaDuplicada_Lanca()
    {
        var clienteId = await NovoClienteAsync();
        await _service.CriarAsync(Param(clienteId, "ABC-1234"));

        await Assert.ThrowsAsync<PlacaDuplicadaException>(() => _service.CriarAsync(Param(clienteId, "abc1234")));
    }

    [Fact]
    public async Task Listar_FiltraPorPlacaModeloECliente()
    {
        var c1 = await NovoClienteAsync();
        var c2 = await NovoClienteAsync();
        await _service.CriarAsync(Param(c1, "ABC-1234"));
        await _service.CriarAsync(new CarroParameter { ClienteId = c2, Marca = "VW", Modelo = "Gol", Placa = "XYZ1D23" });

        Assert.Single((await _service.ListarAsync("abc-12", null, 1, 10)).Items);
        Assert.Single((await _service.ListarAsync("Gol", null, 1, 10)).Items);
        Assert.Single((await _service.ListarAsync(null, c1, 1, 10)).Items);
        Assert.Equal(2, (await _service.ListarAsync(null, null, 1, 10)).Total);
    }

    [Fact]
    public async Task Atualizar_Inexistente_LancaNaoEncontrado() =>
        await Assert.ThrowsAsync<NaoEncontradoException>(async () =>
            await _service.AtualizarAsync(99, Param(await NovoClienteAsync())));

    [Fact]
    public async Task Excluir_Existente_Remove()
    {
        var carro = await _service.CriarAsync(Param(await NovoClienteAsync()));

        await _service.ExcluirAsync(carro.Id);

        Assert.Empty(_db.TbCarros);
    }
}

[Trait("Category", "Unit")]
public class OrdemServicoServiceTests
{
    private readonly OficinaDbContext _db = DbFactory.Criar();
    private readonly OrdemServicoService _service;

    public OrdemServicoServiceTests() => _service = new OrdemServicoService(_db);

    private async Task<int> NovoCarroAsync(string placa = "ABC1234")
    {
        var cliente = new TbCliente { Nome = "Ana", Cpf = Guid.NewGuid().ToString("N")[..11], Contato = "x" };
        var carro = new TbCarro { Cliente = cliente, Marca = "Fiat", Modelo = "Uno", Placa = placa };
        _db.TbCarros.Add(carro);
        await _db.SaveChangesAsync();
        return carro.Id;
    }

    private static OrdemServicoParameter Param(int carroId) =>
        new() { CarroId = carroId, DescricaoOrdem = " Troca de óleo ", ValorServico = 150m };

    private static AtualizarEtapaParameter Etapa(EtapaOrdem e, DateOnly? retirada = null) =>
        new() { Etapa = e, DataRetiradaVeiculo = retirada };

    [Fact]
    public async Task Criar_NasceEmRascunhoComDataDeEntradaHoje()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));

        Assert.Equal(EtapaOrdem.Rascunho, ordem.Etapa);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), ordem.DataEntradaCarro);
        Assert.Equal("Troca de óleo", ordem.DescricaoOrdem);
        Assert.Null(ordem.DataInicioServico);
    }

    [Fact]
    public async Task Criar_CarroInexistente_LancaNaoEncontrado() =>
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.CriarAsync(Param(99)));

    [Theory]
    [InlineData(EtapaOrdem.Inicio)]
    [InlineData(EtapaOrdem.EmAndamento)]
    public async Task AtualizarEtapa_InicioOuEmAndamento_PreencheDataInicio(EtapaOrdem etapa)
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));

        var r = await _service.AtualizarEtapaAsync(ordem.Id, Etapa(etapa));

        Assert.Equal(etapa, r.Etapa);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Today), r.DataInicioServico);
        Assert.Null(r.DataFimServico);
    }

    [Fact]
    public async Task AtualizarEtapa_Finalizada_PreencheFimEInicioVazio()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));
        var retirada = new DateOnly(2030, 1, 2);

        var r = await _service.AtualizarEtapaAsync(ordem.Id, Etapa(EtapaOrdem.Finalizada, retirada));

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        Assert.Equal(hoje, r.DataFimServico);
        Assert.Equal(hoje, r.DataInicioServico);
        Assert.Equal(retirada, r.DataRetiradaVeiculo);
    }

    [Fact]
    public async Task AtualizarEtapa_PularDeEmAndamentoParaCancelada_PermiteSemPreencherFim()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));
        await _service.AtualizarEtapaAsync(ordem.Id, Etapa(EtapaOrdem.EmAndamento));

        var r = await _service.AtualizarEtapaAsync(ordem.Id, Etapa(EtapaOrdem.Cancelada));

        Assert.Equal(EtapaOrdem.Cancelada, r.Etapa);
        Assert.Null(r.DataFimServico);
    }

    [Theory]
    [InlineData(EtapaOrdem.EmAndamento, EtapaOrdem.Inicio)]
    [InlineData(EtapaOrdem.EmAndamento, EtapaOrdem.EmAndamento)]
    [InlineData(EtapaOrdem.Finalizada, EtapaOrdem.Rascunho)]
    public async Task AtualizarEtapa_EtapaMenorOuIgual_Lanca(EtapaOrdem atual, EtapaOrdem nova)
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));
        await _service.AtualizarEtapaAsync(ordem.Id, Etapa(atual));

        await Assert.ThrowsAsync<TransicaoEtapaInvalidaException>(() => _service.AtualizarEtapaAsync(ordem.Id, Etapa(nova)));
    }

    [Fact]
    public async Task AtualizarEtapa_ValorForaDoEnum_Lanca()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));

        await Assert.ThrowsAsync<TransicaoEtapaInvalidaException>(() =>
            _service.AtualizarEtapaAsync(ordem.Id, Etapa((EtapaOrdem)9)));
    }

    [Fact]
    public async Task AtualizarEtapa_Inexistente_LancaNaoEncontrado() =>
        await Assert.ThrowsAsync<NaoEncontradoException>(() => _service.AtualizarEtapaAsync(99, Etapa(EtapaOrdem.Inicio)));

    [Fact]
    public async Task Listar_FiltraPorEtapaPlacaEPeriodo()
    {
        var carro1 = await NovoCarroAsync("ABC1234");
        var carro2 = await NovoCarroAsync("XYZ1D23");
        var o1 = await _service.CriarAsync(Param(carro1));
        await _service.CriarAsync(new OrdemServicoParameter
        {
            CarroId = carro2, DescricaoOrdem = "x", ValorServico = 1, DataEntradaCarro = new DateOnly(2020, 5, 1),
        });
        await _service.AtualizarEtapaAsync(o1.Id, Etapa(EtapaOrdem.Inicio));

        Assert.Single((await _service.ListarAsync(EtapaOrdem.Inicio, null, null, null, 1, 10)).Items);
        Assert.Single((await _service.ListarAsync(null, "xyz", null, null, 1, 10)).Items);
        Assert.Single((await _service.ListarAsync(null, null, new DateOnly(2020, 1, 1), new DateOnly(2020, 12, 31), 1, 10)).Items);
        Assert.Equal(2, (await _service.ListarAsync(null, null, null, null, 1, 10)).Total);
    }

    [Fact]
    public async Task Obter_RetornaCarroECliente()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));

        var detalhe = await _service.ObterAsync(ordem.Id);

        Assert.Equal("Ana", detalhe.Cliente.Nome);
        Assert.Equal("ABC1234", detalhe.Carro.Placa);
    }

    [Fact]
    public async Task Excluir_Existente_Remove()
    {
        var ordem = await _service.CriarAsync(Param(await NovoCarroAsync()));

        await _service.ExcluirAsync(ordem.Id);

        Assert.Empty(_db.TbOrdensServicos);
    }
}

internal static class DbFactory
{
    public static OficinaDbContext Criar() => new(
        new DbContextOptionsBuilder<OficinaDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
}

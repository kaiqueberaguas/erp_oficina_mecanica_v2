using Microsoft.EntityFrameworkCore;
using Moq;
using WebApi.DTOs;
using WebApi.Exceptions;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Tests.Unit;

[Trait("Category", "Unit")]
public class AuthServiceTests
{
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenService> _tokens = new();
    private readonly OficinaDbContext _db;
    private readonly AuthService _service;

    public AuthServiceTests()
    {
        var options = new DbContextOptionsBuilder<OficinaDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new OficinaDbContext(options);

        _hasher.Setup(h => h.Hash(It.IsAny<string>())).Returns<string>(s => $"hash:{s}");
        _hasher.Setup(h => h.Verificar(It.IsAny<string>(), It.IsAny<string>()))
            .Returns<string, string>((s, h) => h == $"hash:{s}");
        _tokens.Setup(t => t.Gerar(It.IsAny<TbUsuario>()))
            .Returns(("token-falso", DateTime.UtcNow.AddHours(1)));

        _service = new AuthService(_db, _hasher.Object, _tokens.Object);
    }

    [Fact]
    public async Task Registrar_DadosValidos_PersisteUsuarioComSenhaHasheada()
    {
        var dto = await _service.RegistrarAsync(new RegisterRequest { Nome = " Ana ", Login = " ana@x.com ", Senha = "123456" });

        Assert.Equal("Ana", dto.Nome);
        Assert.Equal("ana@x.com", dto.Login);
        var salvo = await _db.TbUsuarios.SingleAsync();
        Assert.Equal("hash:123456", salvo.SenhaHash);
    }

    [Fact]
    public async Task Registrar_LoginDuplicado_LancaExcecao()
    {
        await _service.RegistrarAsync(new RegisterRequest { Nome = "Ana", Login = "ana", Senha = "123456" });

        await Assert.ThrowsAsync<LoginDuplicadoException>(() =>
            _service.RegistrarAsync(new RegisterRequest { Nome = "Outra", Login = "ana", Senha = "abcdef" }));
    }

    [Fact]
    public async Task Login_CredenciaisCorretas_RetornaTokenEUsuario()
    {
        await _service.RegistrarAsync(new RegisterRequest { Nome = "Ana", Login = "ana", Senha = "123456" });

        var resposta = await _service.LoginAsync(new LoginRequest { Login = "ana", Senha = "123456" });

        Assert.Equal("token-falso", resposta.Token);
        Assert.Equal("ana", resposta.Usuario.Login);
    }

    [Fact]
    public async Task Login_SenhaIncorreta_LancaExcecao()
    {
        await _service.RegistrarAsync(new RegisterRequest { Nome = "Ana", Login = "ana", Senha = "123456" });

        await Assert.ThrowsAsync<CredenciaisInvalidasException>(() =>
            _service.LoginAsync(new LoginRequest { Login = "ana", Senha = "errada" }));
    }

    [Fact]
    public async Task Login_UsuarioInexistente_LancaExcecao()
    {
        await Assert.ThrowsAsync<CredenciaisInvalidasException>(() =>
            _service.LoginAsync(new LoginRequest { Login = "ninguem", Senha = "123456" }));
    }

    [Fact]
    public async Task ObterPorId_Inexistente_RetornaNulo()
    {
        Assert.Null(await _service.ObterPorIdAsync(999));
    }
}

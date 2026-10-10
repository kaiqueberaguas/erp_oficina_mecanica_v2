using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using WebApi.Models;
using WebApi.Services;

namespace WebApi.Tests.Unit;

[Trait("Category", "Unit")]
public class TokenServiceTests
{
    private static TokenService CriarServico(int minutos = 60) => new(Options.Create(new JwtOptions
    {
        Key = "chave-de-teste-com-mais-de-32-caracteres-0123456789",
        Issuer = "emissor-teste",
        Audience = "audiencia-teste",
        ExpiresMinutes = minutos,
    }));

    [Fact]
    public void Gerar_IncluiClaimsEmissorEAudiencia()
    {
        var usuario = new TbUsuario { Id = 7, Nome = "Maria", Login = "maria@oficina.com" };

        var (token, expiraEm) = CriarServico().Gerar(usuario);
        var jwt = new JsonWebTokenHandler().ReadJsonWebToken(token);

        Assert.Equal("7", jwt.Subject);
        Assert.Equal("maria@oficina.com", jwt.GetClaim("unique_name").Value);
        Assert.Equal("Maria", jwt.GetClaim("nome").Value);
        Assert.Equal("emissor-teste", jwt.Issuer);
        Assert.Contains("audiencia-teste", jwt.Audiences);
        Assert.True(expiraEm > DateTime.UtcNow);
    }

    [Fact]
    public void Gerar_RespeitaTempoDeExpiracaoConfigurado()
    {
        var usuario = new TbUsuario { Id = 1, Nome = "A", Login = "a" };

        var (_, expiraEm) = CriarServico(minutos: 5).Gerar(usuario);

        Assert.InRange(expiraEm, DateTime.UtcNow.AddMinutes(4), DateTime.UtcNow.AddMinutes(6));
    }
}

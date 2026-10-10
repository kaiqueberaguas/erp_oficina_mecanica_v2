using WebApi.Services;

namespace WebApi.Tests.Unit;

[Trait("Category", "Unit")]
public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_NaoRetornaSenhaEmTextoPuro()
    {
        var hash = _hasher.Hash("Senha@123");

        Assert.NotEqual("Senha@123", hash);
        Assert.StartsWith("$2", hash);
    }

    [Fact]
    public void Verificar_SenhaCorreta_RetornaTrue()
    {
        var hash = _hasher.Hash("Senha@123");

        Assert.True(_hasher.Verificar("Senha@123", hash));
    }

    [Fact]
    public void Verificar_SenhaIncorreta_RetornaFalse()
    {
        var hash = _hasher.Hash("Senha@123");

        Assert.False(_hasher.Verificar("outra", hash));
    }

    [Fact]
    public void Verificar_HashInvalido_RetornaFalse()
    {
        Assert.False(_hasher.Verificar("Senha@123", "nao-e-um-hash"));
    }

    [Fact]
    public void Verificar_HashDoSeedDoAdmin_AceitaSenhaPadrao()
    {
        const string hashSeed = "$2b$11$NnA.Gu9scta2ozzssQwLuOUBk0yVE4oBuIRRqNFBbF51B.ev0w812";

        Assert.True(_hasher.Verificar("Admin@123", hashSeed));
    }
}

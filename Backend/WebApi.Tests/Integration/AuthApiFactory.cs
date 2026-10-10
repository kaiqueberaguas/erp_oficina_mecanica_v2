using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace WebApi.Tests.Integration;

/// <summary>
/// Sobe a API contra o MySQL do docker-compose (<c>docker compose up -d mysql</c>).
/// A connection string pode ser trocada pela variável de ambiente TEST_DB_CONNECTION.
/// </summary>
public class AuthApiFactory : WebApplicationFactory<Program>
{
    private const string ConexaoPadrao =
        "server=localhost;port=3306;database=oficina_mecanica;user=root;password=root";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection",
            Environment.GetEnvironmentVariable("TEST_DB_CONNECTION") ?? ConexaoPadrao);
        builder.UseSetting("Jwt:Key", "chave-de-teste-integrado-com-mais-de-32-caracteres");
        builder.UseSetting("Jwt:Issuer", "erp-oficina-mecanica");
        builder.UseSetting("Jwt:Audience", "erp-oficina-mecanica-app");
    }
}

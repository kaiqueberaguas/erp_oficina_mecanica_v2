namespace WebApi.Services;

public class JwtOptions
{
    public const string Secao = "Jwt";

    public string Key { get; set; } = null!;
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public int ExpiresMinutes { get; set; } = 60;
}

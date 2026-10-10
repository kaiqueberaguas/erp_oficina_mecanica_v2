using System.Text.RegularExpressions;
using WebApi.Exceptions;

namespace WebApi.Services;

public static partial class Normalizacao
{
    public static string SomenteDigitos(string? valor) =>
        new((valor ?? "").Where(char.IsDigit).ToArray());

    /// <summary>Remove a máscara e valida os dígitos verificadores. Retorna os 11 dígitos.</summary>
    public static string Cpf(string valor)
    {
        var cpf = SomenteDigitos(valor);
        if (!CpfValido(cpf))
            throw new CpfInvalidoException();
        return cpf;
    }

    /// <summary>Maiúsculas e sem hífen; aceita ABC-1234 e ABC1D23.</summary>
    public static string Placa(string valor)
    {
        var placa = (valor ?? "").Trim().Replace("-", "").ToUpperInvariant();
        if (!PlacaRegex().IsMatch(placa))
            throw new PlacaInvalidaException();
        return placa;
    }

    public static string PlacaParaBusca(string valor) => valor.Trim().Replace("-", "").ToUpperInvariant();

    private static bool CpfValido(string cpf)
    {
        if (cpf.Length != 11 || cpf.Distinct().Count() == 1)
            return false;

        return cpf[9] - '0' == Digito(cpf, 9) && cpf[10] - '0' == Digito(cpf, 10);

        static int Digito(string c, int tamanho)
        {
            var soma = 0;
            for (var i = 0; i < tamanho; i++)
                soma += (c[i] - '0') * (tamanho + 1 - i);
            var resto = soma * 10 % 11;
            return resto == 10 ? 0 : resto;
        }
    }

    [GeneratedRegex(@"^[A-Z]{3}(\d{4}|\d[A-Z]\d{2})$")]
    private static partial Regex PlacaRegex();
}

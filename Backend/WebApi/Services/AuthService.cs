using Microsoft.EntityFrameworkCore;
using WebApi.DTOs;
using WebApi.Exceptions;
using WebApi.Models;

namespace WebApi.Services;

public class AuthService(OficinaDbContext db, IPasswordHasher hasher, ITokenService tokens) : IAuthService
{
    public async Task<UsuarioDto> RegistrarAsync(RegisterRequest request)
    {
        var login = request.Login.Trim();

        if (await db.TbUsuarios.AnyAsync(u => u.Login == login))
            throw new LoginDuplicadoException();

        var usuario = new TbUsuario
        {
            Nome = request.Nome.Trim(),
            Login = login,
            SenhaHash = hasher.Hash(request.Senha),
        };

        db.TbUsuarios.Add(usuario);
        await db.SaveChangesAsync();

        return ParaDto(usuario);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var login = request.Login.Trim();
        var usuario = await db.TbUsuarios.FirstOrDefaultAsync(u => u.Login == login);

        if (usuario is null || !hasher.Verificar(request.Senha, usuario.SenhaHash))
            throw new CredenciaisInvalidasException();

        var (token, expiraEm) = tokens.Gerar(usuario);
        return new AuthResponse(token, expiraEm, ParaDto(usuario));
    }

    public async Task<UsuarioDto?> ObterPorIdAsync(int id)
    {
        var usuario = await db.TbUsuarios.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
        return usuario is null ? null : ParaDto(usuario);
    }

    private static UsuarioDto ParaDto(TbUsuario u) => new(u.Id, u.Nome, u.Login);
}

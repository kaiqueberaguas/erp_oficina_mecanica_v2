using WebApi.DTOs;

namespace WebApi.Services;

public interface IAuthService
{
    Task<UsuarioDto> RegistrarAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UsuarioDto?> ObterPorIdAsync(int id);
}

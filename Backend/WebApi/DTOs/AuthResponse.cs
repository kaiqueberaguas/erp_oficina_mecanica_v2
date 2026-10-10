namespace WebApi.DTOs;

public record AuthResponse(string Token, DateTime ExpiraEm, UsuarioDto Usuario);

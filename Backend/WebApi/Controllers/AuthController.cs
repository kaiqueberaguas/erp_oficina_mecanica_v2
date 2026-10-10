using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebApi.DTOs;
using WebApi.Exceptions;
using WebApi.Services;

namespace WebApi.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService auth) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<UsuarioDto>> Register(RegisterRequest request)
    {
        try
        {
            var usuario = await auth.RegistrarAsync(request);
            return Created($"/api/v1/auth/me", usuario);
        }
        catch (LoginDuplicadoException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message, Status = StatusCodes.Status400BadRequest });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        try
        {
            return Ok(await auth.LoginAsync(request));
        }
        catch (CredenciaisInvalidasException ex)
        {
            return Unauthorized(new ProblemDetails { Title = ex.Message, Status = StatusCodes.Status401Unauthorized });
        }
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UsuarioDto>> Me()
    {
        var sub = User.FindFirst("sub")?.Value;
        if (!int.TryParse(sub, out var id))
            return Unauthorized();

        var usuario = await auth.ObterPorIdAsync(id);
        return usuario is null ? Unauthorized() : Ok(usuario);
    }
}

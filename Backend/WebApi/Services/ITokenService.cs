using WebApi.Models;

namespace WebApi.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiraEm) Gerar(TbUsuario usuario);
}

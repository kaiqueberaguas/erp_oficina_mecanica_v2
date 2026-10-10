using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using WebApi.Exceptions;

namespace WebApi.Controllers;

/// <summary>Traduz exceções de domínio em ProblemDetails (o front lê <c>title</c>).</summary>
public class DominioExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var status = context.Exception switch
        {
            NaoEncontradoException => StatusCodes.Status404NotFound,
            ConflitoException => StatusCodes.Status409Conflict,
            RegraNegocioException => StatusCodes.Status400BadRequest,
            _ => (int?)null,
        };

        if (status is null)
            return;

        context.Result = new ObjectResult(new ProblemDetails { Title = context.Exception.Message, Status = status })
        {
            StatusCode = status,
        };
        context.ExceptionHandled = true;
    }
}

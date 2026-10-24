using Microsoft.EntityFrameworkCore;
using WebApi.Presenters;

namespace WebApi.Services;

public static class PaginacaoExtensions
{
    public const int TamanhoMaximo = 100;

    /// <summary>A consulta deve vir ordenada. page &lt; 1 vira 1; pageSize fica entre 1 e 100.</summary>
    public static async Task<PagedResultPresenter<TDto>> PaginarAsync<TEntity, TDto>(
        this IQueryable<TEntity> query, int page, int pageSize, Func<TEntity, TDto> mapear)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, TamanhoMaximo);

        var total = await query.CountAsync();
        var itens = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResultPresenter<TDto>(itens.Select(mapear).ToList(), total, page, pageSize);
    }

    /// <summary>Variante para consultas que já projetam o presenter.</summary>
    public static Task<PagedResultPresenter<T>> PaginarAsync<T>(this IQueryable<T> query, int page, int pageSize) =>
        query.PaginarAsync(page, pageSize, x => x);
}

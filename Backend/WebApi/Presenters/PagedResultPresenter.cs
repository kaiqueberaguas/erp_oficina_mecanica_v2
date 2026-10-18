namespace WebApi.Presenters;

public record PagedResultPresenter<T>(IReadOnlyList<T> Items, int Total, int Page, int PageSize);

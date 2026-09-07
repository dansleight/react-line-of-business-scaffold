namespace Scaffold.Business.Services.RepoBases;

public interface IMappedTableRepository<T> where T : class
{
    Task<IEnumerable<T>> CachedGetAsync();

    Task<IEnumerable<T>> CachedGetAllAsync();

    Task<T?> CachedGetByIdAsync(int id);

    Task<T?> GetByIdAsync(int id);

    Task<T?> GetByKeyAsync(string key);

    Task<IEnumerable<T>> GetAsync();

    Task<IEnumerable<T>> GetAsync(object? whereConditions, object? whereNotConditions = null);

    Task<IEnumerable<T>> GetAllAsync();

    Task<IEnumerable<T>> GetAllAsync(object? whereConditions, object? whereNotConditions = null);

    Task<IEnumerable<T>> GetListPagedAsync(int pageNumber, int rowsPerPage, string orderBy, object? whereConditions = null, object? whereNotConditions = null);

    Task<int> RecordCountAsync(object? whereConditions = null, object? whereNotConditions = null);

    Task<T> SaveAsync(T entity, string? personId = null);

    Task<T> InsertAsync(T entity, string? personId = null);

    Task<int> UpdateAsync(T entity, string? personId = null);

    Task<DeleteAction> DeleteAsync(T entity, string? personId = null);

    Task<DeleteAction> DeleteByIdAsync(int id, string? personId = null);

    Task<DeleteAction> DeleteByKeyAsync(string key, string? personId = null);

    Task<IEnumerable<MappedHistory<T>>> GetHistoryAsync(int id);

    Task<IEnumerable<MappedHistory<T>>> GetHistoryAsync(T keyEntity);
}

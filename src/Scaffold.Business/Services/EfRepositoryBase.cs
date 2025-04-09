using System;
using System.ComponentModel.DataAnnotations;
using System.Data.Common;
using System.Linq.Expressions;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Scaffold.Business.Models.Config;

namespace Scaffold.Business.Services;

public abstract partial class EfRepositoryBase<T> : DbContext where T : class
{
    private readonly string _connectionString;
    protected EfRepositoryBase(IOptions<DataAccessSettings> config)
    {
        _connectionString = config.Value.ConnectionStrings!.Single(x => x.Key == "DefaultConnection").Value;
    }

    public virtual DbSet<T> Entities { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    => optionsBuilder.UseSqlServer(_connectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<T>();
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

    // GetById
    public virtual T? GetById(int id)
    {
        PropertyInfo keyProperty = KeyPropertyHelper.GetSingleKeyProperty<T>();
        if (keyProperty.PropertyType != typeof(int))
            throw new InvalidOperationException("The table's primary key column is not an int. Please use the appropriate method.");

        var parameter = Expression.Parameter(typeof(T), "x");
        var propertyAccess = Expression.Property(parameter, keyProperty);
        var constant = Expression.Constant(id);
        var equality = Expression.Equal(propertyAccess, constant);
        var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

        return Entities.SingleOrDefault(lambda);
    }

    public virtual async Task<T?> GetByIdAsync(int id) => await Task.FromResult(GetById(id));

    // GetByKey
    public virtual T? GetByKey(string key)
    {
        PropertyInfo keyProperty = KeyPropertyHelper.GetSingleKeyProperty<T>();
        if (
            keyProperty.PropertyType != typeof(string) &&
            keyProperty.PropertyType != typeof(Guid))
            throw new InvalidOperationException("The table's primary key column is not a string. Please use the appropriate method.");

        var parameter = Expression.Parameter(typeof(T), "x");
        var propertyAccess = Expression.Property(parameter, keyProperty);
        var constant = Expression.Constant(key);
        var equality = Expression.Equal(propertyAccess, constant);
        var lambda = Expression.Lambda<Func<T, bool>>(equality, parameter);

        return Entities.SingleOrDefault(lambda);
    }

    public virtual IEnumerable<T> Get(object whereConditions)
    {
        IDictionary<string, object> dictionary = (whereConditions as IDictionary<string, object>) ?? whereConditions.GetType().GetProperties().ToDictionary((PropertyInfo x) => x.Name, (PropertyInfo x) => x.GetValue(whereConditions)!);
        return QueryByProperties(dictionary);
    }

    public virtual async Task<T?> GetByKeyAsync(string key) => await Task.FromResult(GetByKey(key));

    // Get
    public virtual IEnumerable<T> Get() => Entities;

    public virtual async Task<IEnumerable<T>> GetAsnyc() => await Task.FromResult(Get());

    public virtual async Task<IEnumerable<T>> GetAsync(object whereConditions) => await Task.FromResult(Get(whereConditions));

    public virtual IEnumerable<T> QueryByProperties(IDictionary<string, object> clauses)
    {
        if (clauses == null || !clauses.Any())
            return new List<T>(); // Return an empty list

        var entityType = typeof(T);
        var parameter = Expression.Parameter(entityType, "x");
        Expression? combinedExpression = null;

        foreach (var clause in clauses)
        {
            // Get the property info from the string name
            var property = entityType.GetProperty(clause.Key)
                ?? throw new ArgumentException($"Property '{clause.Key}' not found on type '{entityType.Name}'.");

            // Access the property (e.g., "x.Property")
            var propertyAccess = Expression.Property(parameter, property);

            // Handle null values and convert the value to the property's type
            Expression constant;
            if (clause.Value == null)
            {
                constant = Expression.Constant(null, property.PropertyType);
            }
            else
            {
                var convertedValue = Convert.ChangeType(clause.Value, Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType);
                constant = Expression.Constant(convertedValue, property.PropertyType);
            }

            // Create the equality expression (eishly "x.Property == value" or "x.Property == null")
            var equality = Expression.Equal(propertyAccess, constant);

            // Combine with previous expressions using AND
            combinedExpression = combinedExpression == null
                ? equality
                : Expression.AndAlso(combinedExpression, equality);
        }

        if (combinedExpression == null)
            return new List<T>();

        // Build the lambda expression (e.g., "x => x.Prop1 == val1 && x.Prop2 == val2")
        var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);

        // Return the queryable with the filter applied
        return Entities.Where(lambda);
    }
}

public static class KeyPropertyHelper
{
    public static PropertyInfo GetSingleKeyProperty<T>()
    {
        var keyProperties = GetKeyProperties<T>();
        if (keyProperties.Count() != 1)
            throw new InvalidOperationException("The requested type doesn't have a single key.");
        return keyProperties.First();
    }

    public static IEnumerable<PropertyInfo> GetKeyProperties<T>()
    {
        return typeof(T).GetProperties()
            .Where(p => p.GetCustomAttributes(typeof(KeyAttribute), false).Length > 0);
    }
}
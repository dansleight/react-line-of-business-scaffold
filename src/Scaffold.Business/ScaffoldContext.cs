using Microsoft.EntityFrameworkCore;

namespace Scaffold.Business;

public partial class ScaffoldContext : DbContext
{
    private readonly string _connectionString;

    public ScaffoldContext(string connectionString)
    {
        _connectionString = connectionString;
    }

    public ScaffoldContext(string connectionString, DbContextOptions<ScaffoldContext> options)
        : base(options)
    {
        _connectionString = connectionString;
    }

    public virtual DbSet<WidgetObject> Widgets { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(_connectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<WidgetObject>();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
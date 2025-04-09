using Microsoft.EntityFrameworkCore;

namespace Scaffold.EFTest;

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

    public virtual DbSet<CollectionObject> Collections { get; set; }
    public virtual DbSet<WidgetObject> Widgets { get; set; }
    public virtual DbSet<BlueTypeObject> BlueTypes { get; set; }
    public virtual DbSet<GreenTypeObject> GreenTypes { get; set; }
    public virtual DbSet<RedTypeObject> RedTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer(_connectionString);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CollectionObject>();
        modelBuilder.Entity<WidgetObject>();
        modelBuilder.Entity<BlueTypeObject>();
        modelBuilder.Entity<GreenTypeObject>();
        modelBuilder.Entity<RedTypeObject>();

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

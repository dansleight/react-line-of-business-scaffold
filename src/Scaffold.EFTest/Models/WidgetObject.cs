using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scaffold.EFTest;

[Table("dat_Widget")]
public partial class WidgetObject
{
    [Column, Key]
    public int WidgetId { get; set; }

    [Column]
    public int CollectionId { get; set; }

    [Column, MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column]
    public string? Description { get; set; }

    [Column(TypeName = "nvarchar")]
    public WidgetType WidgetType { get; set; }

    [Column]
    public int? RedTypeId { get; set; }

    [Column]
    public int BlueTypeId { get; set; }

    [Column(TypeName = "datetime")]
    public DateTime? ApprovalDate { get; set; }

    public virtual BlueTypeObject BlueType { get; set; } = null!;

    public virtual CollectionObject Collection { get; set; } = null!;

    public virtual RedTypeObject? RedType { get; set; }

    public virtual ICollection<GreenTypeObject> GreenTypes { get; set; } = new List<GreenTypeObject>();
}

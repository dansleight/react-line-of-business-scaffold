using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scaffold.EFTest;

[Table("dat_Collection")]
public partial class CollectionObject
{
    [Column, Key]
    public int CollectionId { get; set; }

    [Column, MaxLength(100)]
    public string Name { get; set; } = null!;

    [Column]
    public string? Description { get; set; }

    [Column(TypeName = "nvarchar")]
    public CollectionType CollectionType { get; set; }

    public virtual ICollection<WidgetObject> Widgets { get; set; } = new List<WidgetObject>();
}

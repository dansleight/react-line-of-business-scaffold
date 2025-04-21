using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scaffold.Business;

[Table("dat_Widget")]
public class WidgetObject
{
    #region Properties

    [Column, Key]
    public int WidgetId { get; set; }

    [Column]
    public string Name { get; set; } = null!;

    [Column]
    public string? Description { get; set; }

    #endregion

    #region Constructor

    internal WidgetObject() { }

    public WidgetObject(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    #endregion
}

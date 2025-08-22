using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Scaffold.Business.Enums;

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

    [Column]
    public WidgetType WidgetType { get; set; }

    [Column]
    public int? RedTypeId { get; set; }

    [Column]
    public int BlueTypeId { get; set; }

    public DateTime? ApprovalDate { get; set; }

    #endregion

    #region Constructor

    internal WidgetObject() { }

    public WidgetObject(string name, WidgetType widgetType, int blueTypeId)
    {
        Name = name;
        WidgetType = widgetType;
        BlueTypeId = blueTypeId;
    }

    #endregion
}

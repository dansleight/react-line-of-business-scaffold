using System;
using System.ComponentModel.DataAnnotations;
using Scaffold.Business;
using Scaffold.Business.Enums;
using Scaffold.Classes;

namespace Scaffold.SpaModels;

public class UpdateWidgetModel
{
    #region Properties

    public int WidgetId { get; set; }

    [Display(Name = "Name")]
    [MaxLength(100)]
    [Required]
    public string Name { get; set; } = null!;

    [Display(Name = "Widget Description", Description = "Describe the Widget")]
    [InputType("textarea")]
    public string? Description { get; set; }

    [Display(Name = "Type")]
    [InputType("dropdown")]
    public WidgetType WidgetType { get; set; }

    [Display(Name = "Red Type")]
    [InputType("dropdown")]
    public int? RedTypeId { get; set; }

    [Display(Name = "Blue Type")]
    [InputType("dropdown")]
    public int BlueTypeId { get; set; }

    #endregion

    #region Object Methods

    public WidgetObject ToWidgetObject() => new WidgetObject(Name, WidgetType, BlueTypeId)
    {
        WidgetId = WidgetId,
        Description = Description,
        RedTypeId = RedTypeId,
    };

    #endregion
}

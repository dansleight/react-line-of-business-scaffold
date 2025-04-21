using System;
using Scaffold.Business;

namespace Scaffold.SpaModels;

public class AddWidgetModel
{
    #region Properties

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    #endregion

    #region Object Methods

    public WidgetObject ToWidgetObject() => new WidgetObject(Name, Description);

    #endregion
}

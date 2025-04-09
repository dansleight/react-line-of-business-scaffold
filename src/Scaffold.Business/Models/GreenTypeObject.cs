using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Scaffold.Business;

[Table("lu_GreenType")]
public class GreenTypeObject
{
    #region Properties

    [Column, Key]
    public int GreenTypeId { get; set;}

    [Column]
    public string Name { get; set;}



    #endregion Properties

    #region Extended Properties

    private List<int>? widgetIds = null;
    public List<int>? WidgetIds
    {
        get
        {
            if (Widgets != null)
                return Widgets.Select(x => x.WidgetId).ToList();
            else if (widgetIds != null)
                return widgetIds;
            return null;
        }
        set 
        {
            if (value == null) return; // never set this list to null, let it be null after the constructor, or sit it to an empty list
            Widgets = null; // assuming this list is being set on purpose, to overwrite the current set
            WidgetIds = value;
        }
    }
    
    public List<WidgetObject>? Widgets { get; set; }



    #endregion Extended Properties

    #region Constructor

    internal GreenTypeObject()
    {
        Name = null!;
    }
    
    public GreenTypeObject(
        string name
    )
    {
        Name = name;
    }

    #endregion Constructor

}

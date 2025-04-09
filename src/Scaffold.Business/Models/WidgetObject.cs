using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Scaffold.Business;

[Table("dat_Widget")]
public class WidgetObject
{
    #region Properties

    [Column, Key]
    public int WidgetId { get; set;}

    [Column]
    public int CollectionId { get; set;}

    [Column]
    public string Name { get; set;}

    [Column]
    public string? Description { get; set;}

    [Column(TypeName = "nvarchar")]
    public WidgetType WidgetType { get; set;}

    [Column]
    public int? RedTypeId { get; set;}

    [Column]
    public int BlueTypeId { get; set;}

    [Column, JsonIgnore]
    public DateTime? ApprovalDate { get; set;}



    #endregion Properties

    #region Dates As Strings

    [JsonProperty("approvalDate")]
    public string? ApprovalDateObject => ApprovalDate?.ToString("MMM d, yyyy");



    #endregion Dates As Strings

    #region Lookup Objects

    public RedTypeObject? RedType { get; set; }

    public BlueTypeObject? BlueType { get; set; }



    #endregion Lookup Objects

    #region Extended Properties

    private List<int>? greenTypeIds = null;
    public List<int>? GreenTypeIds
    {
        get
        {
            if (GreenTypes != null)
                return GreenTypes.Select(x => x.GreenTypeId).ToList();
            else if (greenTypeIds != null)
                return greenTypeIds;
            return null;
        }
        set 
        {
            if (value == null) return; // never set this list to null, let it be null after the constructor, or sit it to an empty list
            GreenTypes = null; // assuming this list is being set on purpose, to overwrite the current set
            GreenTypeIds = value;
        }
    }
    
    public List<GreenTypeObject>? GreenTypes { get; set; }



    #endregion Extended Properties

    #region Constructor

    internal WidgetObject()
    {
        Name = null!;
    }
    
    public WidgetObject(
        int collectionId,
        string name,
        WidgetType widgetType,
        int blueTypeId
    )
    {
        CollectionId = collectionId;
        Name = name;
        WidgetType = widgetType;
        BlueTypeId = blueTypeId;
    }

    #endregion Constructor

}

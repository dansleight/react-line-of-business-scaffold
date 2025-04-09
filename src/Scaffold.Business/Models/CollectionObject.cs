using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Scaffold.Business;

[Table("dat_Collection")]
public class CollectionObject
{
    #region Properties

    [Column, Key]
    public int CollectionId { get; set;}

    [Column]
    public string Name { get; set;}

    [Column]
    public string? Description { get; set;}

    [Column(TypeName = "nvarchar")]
    public CollectionType CollectionType { get; set;}



    #endregion Properties

    #region Constructor

    internal CollectionObject()
    {
        Name = null!;
    }
    
    public CollectionObject(
        string name,
        CollectionType collectionType
    )
    {
        Name = name;
        CollectionType = collectionType;
    }

    #endregion Constructor

}

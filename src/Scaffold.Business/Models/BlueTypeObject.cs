using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Scaffold.Business;

[Table("lu_BlueType")]
public class BlueTypeObject
{
    #region Properties

    [Column, Key]
    public int BlueTypeId { get; set;}

    [Column]
    public string Name { get; set;}



    #endregion Properties

    #region Constructor

    internal BlueTypeObject()
    {
        Name = null!;
    }
    
    public BlueTypeObject(
        string name
    )
    {
        Name = name;
    }

    #endregion Constructor

}

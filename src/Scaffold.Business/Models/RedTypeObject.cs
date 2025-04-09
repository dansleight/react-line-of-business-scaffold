using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace Scaffold.Business;

[Table("lu_RedType")]
public class RedTypeObject
{
    #region Properties

    [Column, Key]
    public int RedTypeId { get; set;}

    [Column]
    public string Name { get; set;}



    #endregion Properties

    #region Constructor

    internal RedTypeObject()
    {
        Name = null!;
    }
    
    public RedTypeObject(
        string name
    )
    {
        Name = name;
    }

    #endregion Constructor

}

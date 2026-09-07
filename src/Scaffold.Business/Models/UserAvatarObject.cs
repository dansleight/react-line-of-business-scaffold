using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scaffold.Business;

[Table("dat_UserAvatar")]
public class UserAvatarObject
{
    [Column, Key]
    public string PersonId { get; set; } = "";

    [Column(TypeName = "nvarchar")]
    public AvatarSource Source { get; set; }

    [Column]
    public string ContentType { get; set; } = "";

    [Column]
    public byte[] Content { get; set; } = [];

    [Column]
    public DateTime UpdatedOn { get; set; }
}

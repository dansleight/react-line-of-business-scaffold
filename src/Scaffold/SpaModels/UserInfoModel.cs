using System.Security.Claims;

namespace Scaffold.SpaModels;

public class UserInfoModel
{
    #region Properties

    public string PersonId { get; set; }
    public string? Email { get; set; }
    public string DisplayName { get; set; }
    public List<string> Roles { get; set; }

    #endregion

    #region Constructor

    public UserInfoModel(ClaimsPrincipal user, IConfiguration configuration)
    {
        PersonId = user.GetPersonId();
        Email = user.FindEmail();
        DisplayName = user.FindDisplayName() ?? user.FindEmail()?.Split(['@'], StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? user.GetPersonId();
        List<string> roles = RoleMapping.GetRolesFromClaims(configuration, user.Claims);
        Roles = roles.Select(r => r.ToLower()).ToList();
    }

    #endregion
}
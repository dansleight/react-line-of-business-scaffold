from typing import Iterable

from app.auth.auth_user import AuthUser
from app.config import RoleMappingConfig, settings


def get_roles_from_claims(
    claims_groups: Iterable[str],
    mappings: Iterable[RoleMappingConfig] | None = None,
) -> list[str]:
    """Map Entra group claims to application roles. Mirrors C# RoleMapping."""
    mapping_list = list(mappings) if mappings is not None else list(settings.role_mappings)
    groups = list(claims_groups)
    roles: list[str] = []
    for mapping in mapping_list:
        for group in mapping.groups:
            if group in groups:
                roles.append(mapping.role)
    seen: set[str] = set()
    distinct: list[str] = []
    for role in roles:
        if role not in seen:
            seen.add(role)
            distinct.append(role)
    return distinct


def roles_for_user(user: AuthUser) -> list[str]:
    return [role.lower() for role in get_roles_from_claims(user.groups())]

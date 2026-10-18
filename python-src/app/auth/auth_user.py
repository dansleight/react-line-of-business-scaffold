from typing import Optional

PERSON_ID_CLAIM_TYPES = ["employeeid", "san", "email", "preferred_username", "oid", "name"]
EMAIL_CLAIM_TYPES = ["email", "preferred_username", "upn", "unique_name"]
NAME_CLAIM_TYPES = ["name", "given_name"]


class AuthUser:
    """Authenticated caller, built from JWT claims. Mirrors C# IdentityExtensions."""

    def __init__(self, claims: dict, token: Optional[str] = None):
        self.claims = claims
        self.token = token

    def _claim_value(self, claim_type: str) -> Optional[str]:
        for key, value in self.claims.items():
            if str(key).lower() != claim_type.lower():
                continue
            if value is None:
                continue
            text = str(value).strip()
            if text:
                return text
        return None

    def find_person_id(self) -> Optional[str]:
        for claim_type in PERSON_ID_CLAIM_TYPES:
            value = self._claim_value(claim_type)
            if value:
                return value
        return None

    def get_person_id(self) -> str:
        person_id = self.find_person_id()
        if person_id:
            return person_id
        raise PermissionError(
            "User claims do not contain a claim that can be used as an identifier, checked:"
            + ", ".join(PERSON_ID_CLAIM_TYPES)
        )

    def find_email(self) -> Optional[str]:
        for claim_type in EMAIL_CLAIM_TYPES:
            value = self._claim_value(claim_type)
            if value and "@" in value:
                return value
        return None

    def find_display_name(self) -> Optional[str]:
        for claim_type in NAME_CLAIM_TYPES:
            value = self._claim_value(claim_type)
            if value:
                return value
        given = self._claim_value("given_name")
        family = self._claim_value("family_name")
        if given and family:
            return f"{given} {family}"
        return None

    def display_name(self) -> str:
        name = self.find_display_name()
        if name:
            return name
        email = self.find_email()
        if email:
            local = email.split("@")[0]
            if local:
                return local
        return self.get_person_id()

    def groups(self) -> list[str]:
        value = self.claims.get("groups")
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value]
        return [str(value)]

    @property
    def name(self) -> Optional[str]:
        return self.find_display_name()

    @property
    def scp(self) -> Optional[str]:
        value = self.claims.get("scp")
        return str(value) if value is not None else None

    def __repr__(self) -> str:
        return f"AuthUser(person_id={self.find_person_id()!r})"

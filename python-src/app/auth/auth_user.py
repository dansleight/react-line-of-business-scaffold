from typing import Optional
from fastapi import HTTPException, status

class AuthUser:
    """Represents an authenticated user, constructed from JWT claims."""

    def __init__(self, claims: dict):
        self.claims = claims

    @property
    def name(self) -> Optional[str]:
        return self.claims.get("name")
    
    @property
    def scp(self) -> Optional[str]:
        return self.claims.get("scp")
    
    def __repr__(self) -> str:
        return f"UserObject()"
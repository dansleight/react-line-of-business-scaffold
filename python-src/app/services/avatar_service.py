from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional

import httpx
from sqlalchemy.orm import Session

from app.auth.auth_user import AuthUser
from app.auth.dependencies import get_downstream_token
from app.config import settings
from app.logging.config import logger
from app.models.user_avatar import UserAvatar


class AvatarSource(str, Enum):
    Graph = "Graph"
    Gravatar = "Gravatar"
    Initials = "Initials"


@dataclass
class UserAvatarObject:
    person_id: str
    source: AvatarSource
    content_type: str
    content: bytes
    updated_on: datetime


FRESHNESS = timedelta(days=7)
GRAPH_PHOTO_URL = "https://graph.microsoft.com/v1.0/me/photo/$value"
GRAVATAR_URL = "https://www.gravatar.com/avatar/{hash}?d=404&s=120"


class AvatarService:
    def __init__(self, db: Session):
        self.db = db

    async def get_async(self, user: AuthUser, force_refresh: bool = False) -> UserAvatarObject:
        person_id = user.get_person_id()
        cached = None if force_refresh else self._read_cache(person_id)
        if cached is not None and datetime.now() - cached.updated_on < FRESHNESS:
            return cached

        resolved = await self._resolve(user, person_id)
        return self._save(resolved)

    def _read_cache(self, person_id: str) -> Optional[UserAvatarObject]:
        try:
            row = self.db.query(UserAvatar).filter(UserAvatar.PersonId == person_id).first()
        except Exception:
            logger.warning("Avatar cache read failed", exc_info=True)
            try:
                self.db.rollback()
            except Exception:
                pass
            return None
        if row is None:
            return None
        return UserAvatarObject(
            person_id=row.PersonId,
            source=AvatarSource(row.Source),
            content_type=row.ContentType,
            content=bytes(row.Content),
            updated_on=row.UpdatedOn,
        )

    def _save(self, avatar: UserAvatarObject) -> UserAvatarObject:
        try:
            row = self.db.query(UserAvatar).filter(UserAvatar.PersonId == avatar.person_id).first()
            if row is None:
                row = UserAvatar(PersonId=avatar.person_id)
                self.db.add(row)
            row.Source = avatar.source.value
            row.ContentType = avatar.content_type
            row.Content = avatar.content
            row.UpdatedOn = avatar.updated_on
            self.db.commit()
        except Exception:
            logger.warning("Avatar cache write failed", exc_info=True)
            try:
                self.db.rollback()
            except Exception:
                pass
        return avatar

    async def _resolve(self, user: AuthUser, person_id: str) -> UserAvatarObject:
        photo = await self._try_graph(user)
        if photo is None:
            photo = await self._try_gravatar(user.find_email())
        if photo is None:
            photo = _initials(user, person_id)
        content, content_type, source = photo
        return UserAvatarObject(
            person_id=person_id,
            source=source,
            content_type=content_type,
            content=content,
            updated_on=datetime.now(),
        )

    async def _try_graph(self, user: AuthUser) -> Optional[tuple[bytes, str, AvatarSource]]:
        if not settings.client_secret or not user.token:
            return None
        try:
            access_token = get_downstream_token(user.token, settings.graph_obo_scopes)
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(
                    GRAPH_PHOTO_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
            if response.status_code == 404 or response.status_code >= 400:
                return None
            if not response.content:
                return None
            content_type = response.headers.get("content-type", "image/jpeg").split(";")[0].strip()
            return response.content, content_type or "image/jpeg", AvatarSource.Graph
        except Exception:
            logger.info("Graph profile photo is not available; falling back", exc_info=True)
            return None

    async def _try_gravatar(self, email: Optional[str]) -> Optional[tuple[bytes, str, AvatarSource]]:
        if not email or not email.strip():
            return None
        digest = hashlib.sha256(email.strip().lower().encode("utf-8")).hexdigest()
        url = GRAVATAR_URL.format(hash=digest)
        try:
            async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
                response = await client.get(url)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            if not response.content:
                return None
            content_type = response.headers.get("content-type", "image/jpeg").split(";")[0].strip()
            return response.content, content_type or "image/jpeg", AvatarSource.Gravatar
        except Exception:
            logger.info("Gravatar is not available; falling back", exc_info=True)
            return None


def _initials(user: AuthUser, person_id: str) -> tuple[bytes, str, AvatarSource]:
    initials = _initials_from(user.find_display_name(), user.find_email(), person_id)
    fill = _color_from(person_id)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">\n'
        f'  <rect width="128" height="128" fill="{fill}"/>\n'
        '  <text x="64" y="64" text-anchor="middle" dominant-baseline="central"\n'
        '        font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="52" font-weight="600" fill="#ffffff">'
        f"{initials}</text>\n"
        "</svg>"
    )
    return svg.encode("utf-8"), "image/svg+xml", AvatarSource.Initials


def _first_letter(value: str) -> str:
    for char in value:
        if char.isalnum():
            return char.upper()
    return "?"


def _initials_from(display_name: Optional[str], email: Optional[str], person_id: str) -> str:
    source = display_name or ""
    if not source.strip() and email:
        source = email.split("@")[0].replace(".", " ").replace("_", " ").replace("-", " ")
    if not source.strip():
        source = person_id
    parts = [part for part in source.split(" ") if part]
    if len(parts) >= 2:
        return f"{_first_letter(parts[0])}{_first_letter(parts[-1])}"
    letters = [char.upper() for char in parts[0] if char.isalnum()]
    two = "".join(letters[:2])
    return two if two else "?"


def _color_from(person_id: str) -> str:
    hash_val = 0
    for char in person_id:
        hash_val = hash_val * 31 + ord(char)
        hash_val = (hash_val + 2**31) % 2**32 - 2**31
    hue = abs(hash_val) % 360
    return f"hsl({hue}, 55%, 42%)"

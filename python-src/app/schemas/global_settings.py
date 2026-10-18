from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.utils.naming import to_camel_case


class MsalSettingsModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,
        from_attributes=True,
    )
    ClientId: str
    Authority: str
    ApiScope: str
    Provider: Optional[str] = None


class GlobalSettingsModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel_case,
        populate_by_name=True,
        from_attributes=True,
    )
    ApplicationMode: str
    MsalSettings: Optional[MsalSettingsModel] = None
    BuildNumber: Optional[str] = None

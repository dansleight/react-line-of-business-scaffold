"""Runtime contract checks against the SPA-generated client."""

from __future__ import annotations

import unittest

from app.auth.auth_user import AuthUser
from app.auth.role_mapping import roles_for_user
from app.config import RoleMappingConfig, settings
from app.errors import InvalidRequestError, NotFoundError, from_exception
from app.lookups import LookupItem, LookupModel, LookupType, all_lookups
from app.schemas.api_error import ApiError
from app.schemas.global_settings import GlobalSettingsModel
from app.schemas.test import GoodModel
from app.schemas.user_info import UserInfoModel
from app.services.avatar_service import _color_from, _initials_from


class SpaContractTests(unittest.TestCase):
    def test_json_aliases(self):
        settings_payload = GlobalSettingsModel(
            ApplicationMode="Development",
            MsalSettings=None,
            BuildNumber="1.2.3",
        ).model_dump(by_alias=True)
        self.assertEqual(
            settings_payload,
            {
                "applicationMode": "Development",
                "msalSettings": None,
                "buildNumber": "1.2.3",
            },
        )

        info = UserInfoModel(
            PersonId="oid-1",
            Email="a@b.com",
            DisplayName="Ada Lovelace",
            Roles=["admin"],
        ).model_dump(by_alias=True)
        self.assertEqual(info["personId"], "oid-1")
        self.assertEqual(info["displayName"], "Ada Lovelace")
        self.assertEqual(info["roles"], ["admin"])

        lookup = LookupModel.create(
            lookup_type=LookupType.Unknown,
            items=[LookupItem(Id=1, ParentId=None, Name="None", Active=True)],
        ).model_dump(by_alias=True)
        self.assertEqual(lookup["lookupType"], "Unknown")
        self.assertEqual(lookup["items"][0]["id"], 1)
        self.assertIsNone(lookup["items"][0]["parentId"])

        error = ApiError(
            status=400,
            code="invalid",
            user_message="nope",
            message="detail",
            trace_id="abc",
            errors={"id": ["bad"]},
        ).model_dump(by_alias=True, exclude_none=True)
        self.assertEqual(error["userMessage"], "nope")
        self.assertEqual(error["traceId"], "abc")

    def test_identity_and_roles(self):
        user = AuthUser(
            claims={
                "employeeid": "user-1",
                "oid": "oid-ignored",
                "email": "ada@example.com",
                "name": "Ada Lovelace",
                "groups": ["Admins"],
            }
        )
        self.assertEqual(user.get_person_id(), "user-1")
        self.assertEqual(user.find_email(), "ada@example.com")
        self.assertEqual(user.display_name(), "Ada Lovelace")
        original = list(settings.role_mappings)
        try:
            settings.role_mappings = [RoleMappingConfig(role="Admin", groups=["Admins"])]
            self.assertEqual(roles_for_user(user), ["admin"])
        finally:
            settings.role_mappings = original

    def test_lookups_empty_by_default(self):
        self.assertEqual(all_lookups(), [])

    def test_good_model_randomizes_id_one(self):
        model = GoodModel.from_id(1)
        self.assertGreaterEqual(model.Id, 1001)
        self.assertLessEqual(model.Id, 9999)
        self.assertTrue(model.Name)

    def test_error_mapping(self):
        not_found = from_exception(NotFoundError(), "t1")
        self.assertEqual(not_found.status, 404)
        self.assertEqual(not_found.code, "not_found")
        invalid = from_exception(InvalidRequestError("user", "dev"), "t2")
        self.assertEqual(invalid.status, 400)
        self.assertEqual(invalid.code, "invalid")
        self.assertEqual(invalid.user_message, "user")
        self.assertEqual(invalid.message, "dev")
        unhandled = from_exception(RuntimeError("boom"), "t3")
        self.assertEqual(unhandled.status, 500)
        self.assertEqual(unhandled.code, "unhandled")
        self.assertIn("t3", unhandled.user_message)

    def test_initials(self):
        self.assertEqual(_initials_from("Ada Lovelace", "ada@example.com", "x"), "AL")
        self.assertEqual(_initials_from(None, "ada.lovelace@example.com", "x"), "AL")
        self.assertEqual(_initials_from(None, None, "ab"), "AB")
        self.assertTrue(_color_from("user-1").startswith("hsl("))

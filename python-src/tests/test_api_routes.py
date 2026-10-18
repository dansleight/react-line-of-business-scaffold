"""HTTP-level checks for the SPA client paths."""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.auth.auth_user import AuthUser
from app.auth.dependencies import validate_token
from app.database.dependencies import get_db
from app.main import app


class _FakeQuery:
    def filter(self, *args, **kwargs):
        return self

    def first(self):
        return None


class _FakeDb:
    def query(self, *args, **kwargs):
        return _FakeQuery()

    def add(self, *args, **kwargs):
        pass

    def commit(self):
        pass

    def rollback(self):
        pass


def _user() -> AuthUser:
    return AuthUser(
        claims={
            "employeeid": "user-1",
            "oid": "oid-ignored",
            "email": "nobody-at-all@example.invalid",
            "name": "Ada Lovelace",
            "groups": ["Admins"],
        },
        token="token",
    )


class ApiRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.dependency_overrides[validate_token] = _user
        app.dependency_overrides[get_db] = lambda: _FakeDb()
        cls.client = TestClient(app, raise_server_exceptions=False)

    @classmethod
    def tearDownClass(cls):
        app.dependency_overrides.clear()

    def test_settings_shape(self):
        response = self.client.get("/api/settings")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["applicationMode"], "Development")
        self.assertEqual(body["buildNumber"], "1.2.3")
        self.assertGreaterEqual(set(body["msalSettings"]), {"clientId", "authority", "apiScope"})

    def test_info_shape(self):
        response = self.client.get("/api/info")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["personId"], "user-1")
        self.assertEqual(body["email"], "nobody-at-all@example.invalid")
        self.assertEqual(body["displayName"], "Ada Lovelace")
        self.assertIn("admin", body["roles"])

    def test_lookup_all_empty(self):
        response = self.client.get("/api/lookup")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_lookup_unknown_is_400(self):
        response = self.client.get("/api/lookup/type/Unknown")
        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertEqual(body["code"], "invalid")
        self.assertEqual(body["userMessage"], "Unknown Lookup Type provided.")
        self.assertIn("traceId", body)

    def test_test_endpoints(self):
        good = self.client.get("/api/test/2")
        self.assertEqual(good.status_code, 200)
        self.assertEqual(good.json()["id"], 2)
        self.assertIn("name", good.json())

        bad = self.client.get("/api/test/0")
        self.assertEqual(bad.status_code, 400)
        self.assertEqual(bad.json()["code"], "invalid")
        self.assertTrue(bad.json()["userMessage"].startswith("The value of '0'"))

        missing = self.client.get("/api/test/-2")
        self.assertEqual(missing.status_code, 404)
        self.assertEqual(missing.json()["code"], "not_found")

        boom = self.client.get("/api/test/-1")
        self.assertEqual(boom.status_code, 500)
        self.assertEqual(boom.json()["code"], "unhandled")
        self.assertIn("traceId", boom.json())

    def test_validation_is_400_not_422(self):
        response = self.client.get("/api/test/not-an-int")
        self.assertEqual(response.status_code, 400)
        body = response.json()
        self.assertEqual(body["code"], "validation")
        self.assertEqual(body["userMessage"], "The inputs supplied to the API are invalid.")
        self.assertTrue(body["errors"])

    def test_openapi_operation_ids(self):
        spec = self.client.get("/swagger/v1/swagger.json").json()
        operation_ids = {
            spec["paths"][path][method].get("operationId")
            for path, methods in spec["paths"].items()
            for method in methods
            if method in {"get", "post", "put", "patch", "delete"}
        }
        for required in {
            "infoGetUserInfoModel",
            "lookupAll",
            "settingsGet",
            "settingsAvatar",
            "settingsRefreshAvatar",
            "testGet",
        }:
            self.assertIn(required, operation_ids)

    def test_avatar_returns_image(self):
        response = self.client.get("/api/settings/avatar")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.headers["content-type"].startswith("image/"))
        self.assertTrue(response.content)

    def test_unauthorized_shape(self):
        app.dependency_overrides.pop(validate_token, None)
        try:
            response = self.client.get("/api/info")
            self.assertEqual(response.status_code, 401)
            body = response.json()
            self.assertEqual(body["code"], "unauthorized")
            self.assertIn("userMessage", body)
            self.assertIn("traceId", body)
        finally:
            app.dependency_overrides[validate_token] = _user

    def test_unknown_api_path_is_json_404(self):
        response = self.client.get("/api/does-not-exist")
        self.assertEqual(response.status_code, 404)
        body = response.json()
        self.assertEqual(body["code"], "not_found")
        self.assertIn("traceId", body)

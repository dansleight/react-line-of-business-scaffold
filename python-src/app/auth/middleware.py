from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Receive, Scope, Send


class NormalizeAuthorizationHeaderMiddleware:
    """If Authorization is a raw JWT, prefix Bearer. Mirrors the C# middleware."""

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            headers = MutableHeaders(scope=scope)
            auth = headers.get("authorization")
            if auth and not auth.lower().startswith("bearer ") and " " not in auth:
                headers["authorization"] = f"Bearer {auth}"
        await self.app(scope, receive, send)

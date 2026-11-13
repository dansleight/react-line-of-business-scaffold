# FastAPI Prototype
## Hello World!

This is a prototype of a template for Python api development.

I chose FastAPI because it handles multi-threading out of the box, and is fairly complete but not overly opinionated. I have some goals with this so that it can be suitable for creating Enterprise applications, whether line-of-business or Generative AI related.

- Multithreading for better performance.
- Identity handled via Bearer tokens issued by EntraID. This means that we intend to use this from a single-page application.
- Access to Microsoft SQL Server.
- OpenAPI generation
- Logging

## Getting up and Running

You will need to account for the following to get the Python version of the back-end up and running:

- Microsoft SQL Server instance. On a clean clone of the scaffold, start from the root `ReadMe.md` and run setup. In a generated app, the root `ReadMe.md` is the one setup wrote for this project.
- Python 3 (I'd suggest something still supported) and a Virtual Environment

### Python Virtual Environment

Python Virtual Environments have a .gitignore in them that keeps them from being included in source. We don't mess with that. As a result, you'll need to create your own. Be sure you are in the python-src directory in your terminal applicaiton of choice.

```
python -m venv .venv
```

There is a chance you are running in an environment where Python 3 is `python3` rather than just `python`, in which case, you'll need to use:

```
python3 -m venv .venv
```

Understand once you are in the active virtual environment, you'll use `python` normally.

#### Windows

```
./.venv/Scripts/Activate.ps1
pip install -r requirements.txt
```

#### MacOS

```
source .venv/bin/activate
pip install -r requirements.txt
```

If you install additional packages, you'll need to resave the requirements.txt file by running:

```
pip freeze > requirements.txt
```

You will want to set the Python interpreter in vscode: `<ctrl>-p` then `Python: Select Interpreter`, then select your new virtual environment.

### .env.development

In `python-src/` you'll need to create a .env.development file. If you look at `python-src/app/config.py` you can see the values that will need set. To be consistent with a later deployment, I recommend using UPPER CASE for the values. For development, you can pretty much keep the defaults, except for the credentials you'll need for the connection. Here is a sample of the `.env.development` file:

```
# Entra ID settings
ENVIRONMENT = "Development"
TENANT_ID = "your-tenant-id"
CLIENT_ID = "your-client-id"
API_SCOPE = "your-scope"
CLIENT_SECRET = "optional-needed-for-graph-avatars"

# SPA / identity
BUILD_NUMBER = "local"
ROLE_MAPPINGS = [{"Role":"Admin","Groups":["Admins"]}]
GRAPH_SCOPES = ["User.Read"]

# Database Connection String Values
DB_SERVER = "127.0.0.1:1433"
DB_NAME = "Scaff_DB"
DB_USERNAME = "your-username"
DB_PASSWORD = "your-password"
DB_DRIVER = "ODBC+Driver+17+for+SQL+Server" # on windows, this should be "SQL+Server+Native+Client+11.0"
DB_ENCRYPT = "yes"
DB_TRUSTSERVERCERTIFICATE = "yes"
```

`BUILD_NUMBER` values that start with `#` are treated as unset, matching the C# tokenized `#{BuildNumber}#` placeholder.

`ROLE_MAPPINGS` maps Entra `groups` claims to application roles. `/api/info` returns those roles lowercased, same as the C# WebAPI.

#### uvicorn command to bind port

The repo includes the launch.json for debugging the application, and that sets the port to 5011, which is currently what the SPA would expect. If you prefer to just run it command line, from within the venv:

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 5011
```

## SPA contract parity with the C# WebAPI

The FastAPI app is meant to be a drop-in backend for `spa-src`. Paths, JSON camelCase, string enums, and error bodies match the generated client in `spa-src/src/apiClient/`.

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/api/settings` | open | `applicationMode`, `msalSettings`, `buildNumber` |
| GET | `/api/settings/avatar` | bearer | Graph photo, then Gravatar, then initials SVG. Cached 7 days in `dat_UserAvatar`. |
| POST | `/api/settings/avatar/refresh` | bearer | Same resolution, skips cache |
| GET | `/api/info` | bearer | `personId`, `email`, `displayName`, `roles` |
| GET | `/api/lookup` | bearer | Lookup bags. Empty until you `register_lookup(...)` in `app/lookups`. |
| GET | `/api/lookup/type/{lookupType}` | bearer | Single bag, or `400` for `Unknown` / unregistered types |
| GET | `/api/test/{id}` | bearer | `1` success, `0` invalid, `-1` unhandled 500, `<-1` not found |

Errors use the SPA `ApiError` shape (`status`, `code`, `userMessage`, `message`, `traceId`, `errors`, `exception`). Validation failures are **400** (`code=validation`), not FastAPI's default 422. Development mode includes `exception` (type, message, stackTrace, inner).

# Notes

you might have to clear out all of the environment variables at some point. This worked on my mac from within the venv:

```
unset DB_SERVER DB_NAME DB_USERNAME DB_PASSWORD DB_DRIVER DB_ENCRYPT DB_TRUSTSERVERCERTIFICATE CORS_ORIGINS TENANT_ID API_AUDIENCE API_SCOPE
```

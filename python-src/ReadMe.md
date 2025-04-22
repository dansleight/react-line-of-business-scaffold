# FastAPI Prototype

This is a prototype of a template for Python api development.

I chose FastAPI because it handles multi-threading out of the box, and is fairly complete but not overly opinionated. I have some goals with this so that it can be suitable for creating Enterprise applications, whether line-of-business or Generative AI related.

- Multithreading for better performance.
- Identity handled via Bearer tokens issued by EntraID. This means that we intend to use this from a single-page application.
- Access to Microsoft SQL Server.
- OpenAPI generation
- Logging

## Getting up and Running

### SQL Server

You'll need an SQL Server. I run SQL Server in a container. There are really two options, but it seems that using Azure SQL Edge may be better in most scenarios. I think the biggest drawback is likely going to be whether backups can be used in the final environment you may need to support.

Here is the docker command for Windows:

```
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=PlaceHolder&NotARealPassword" -p 1433:1433 --name sql -v C:/SqlServer/data:/var/opt/mssql/data -v C:/SqlServer/log:/var/opt/mssql/log -v C:/SqlServer/secrets:/var/opt/mssql/secrets -v C:/SqlServer/backup:/var/opt/mssql/backup --restart unless-stopped -d mcr.microsoft.com/azure-sql-edge
```

Before you run this, you'll need to create the folder C:\SqlServer, or change the script to point to a directory that best meets your needs.

Mac users will have to adjust the paths, which should be easy enough.

#### Provisioning Script

`assets/DB Scripts/SQL Server/init.sql` will create a database, create tables and populate a few test tables. You'll need a login and user for the database to configure a connection.

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
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

#### MacOS

```
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
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
TENANT_ID = "your-tenant-id"
API_AUDIENCE = "your-client-id"
API_SCOPE = "your-scope"

# Database Connection String Values
DB_SERVER = "127.0.0.1:1433"
DB_NAME = "Scaffold"
DB_USERNAME = "your-username"
DB_PASSWORD = "your-password"
DB_DRIVER = "ODBC+Driver+17+for+SQL+Server" # on windows, this should be "SQL+Server+Native+Client+11.0"
DB_ENCRYPT = "yes"
DB_TRUSTSERVERCERTIFICATE = "yes"

# CORS origins
CORS_ORIGINS = "http://localhost" # not doing anything with this yet

```

#### uvicorn command to bind port

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

# Notes

you might have to clear out all of the environment variables at some point. This worked on my mac from within the venv:

```
unset DB_SERVER DB_NAME DB_USERNAME DB_PASSWORD DB_DRIVER DB_ENCRYPT DB_TRUSTSERVERCERTIFICATE CORS_ORIGINS TENANT_ID API_AUDIENCE API_SCOPE
```

# FastAPI Prototype

This is a prototype of a template for Python api development.

I chose FastAPI because it handles multi-threading out of the box, and is fairly complete but not overly opinionated. I have some goals with this so that it can be suitable for creating Enterprise applications, whether line-of-business or Generative AI related.

- Multithreading for better performance.
- Identity handled via Bearer tokens issued by EntraID. This means that we intend to use this from a single-page application.
- Access to Microsoft SQL Server.
- OpenAPI generation
- Logging

## Getting up and Running

You'll need an SQL Server. I run SQL Server in a container. There are really two options, but it seems that using Azure SQL Edge may be better in most scenarios. I think the biggest drawback is likely going to be whether backups can be used in the final environment you may need to support.

Here is the docker command for Windows:

```
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=PlaceHolder&NotARealPassword" -p 1433:1433 --name sql -v C:/SqlServer/data:/var/opt/mssql/data -v C:/SqlServer/log:/var/opt/mssql/log -v C:/SqlServer/secrets:/var/opt/mssql/secrets -v C:/SqlServer/backup:/var/opt/mssql/backup --restart unless-stopped -d mcr.microsoft.com/azure-sql-edge
```

Before you run this, you'll need to create the folder C:\SqlServer, or change the script to point to a directory that best meets your needs.

Mac users will have to adjust the paths, which should be easy enough.

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
./.env/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

#### MacOS

```
source .env/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

If you install additional packages, you'll need to resave the requirements.txt file by running:

```
pip freeze > requirements.txt
```

#### uvicorn command to bind port

```
uvicorn app.main:app --reload --host 0.0.0.0 --port 8011
```

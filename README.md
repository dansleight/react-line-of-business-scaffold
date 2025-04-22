# react-line-of-business-scaffold

The intent of this project is to create a React SPA front-end with either a dotnet web-api back-end or a python fastapi back-end, either with a flexible configuration to use as a scaffold for new line-of-business (admin) projects.

I use scaffold purposefully. The intent is to give the developer a canvas, not a framework. Once you have instantiated your own copy, do what you need to have it fit your needs.

## Current State

Both a WebAPI/C# and a FastAPI/Python are in place, in various states of readiness. The C# probably more ready than the Python, but it's getting there.

The SPA is pretty far along, and really just lacks some polish, and perhaps more examples. I'd really like to establish a few capablities:

- Create a forms pattern that uses the generated contracts to help with generation and validation. Creating and binding forms should be really easy with this framework.
- Be able to easiliy bind collections of data to a grid. I'd like to use the free version of AG-Grid, as I believe it is well enhanced by buying licensing, especially in a line-of-bussiness scenario.

## Documentation

I'll be working a bit on documentation, but not comprehensive instructions on how to be a developer.

## Choices

There are a lot of decisions I've made here that I'll work to explain. I don't think that you would use this scaffold inside of an organization without doing some licensing, for instance:

- I've included the free fontwesome libraries, however, if I were using this to produce a production, internal application, I'd license my development team to use the full version.
- I'm intending to include the free version of AG-Grid, but feel the same about that, I'd license my development team to the full version, especially if I were surfacing any significant amount of financial data.

## Getting up and running: SQL Server

Both back-end applications (.NET WebAPI and Python FastAPI) connect to a Microsoft SQL Server. I generally run SQL Server locally in a docker container. Here are some hints to get that going:

### SQL Server

There are really two primary options for running SQL Server from a container, but it seems that using Azure SQL Edge may be better in most scenarios. I think the biggest drawback is likely going to be whether backups can be used in the final environment you may need to support.

Here is the docker command for Windows:

```
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=PlaceHolder&NotARealPassword" -p 1433:1433 --name sql -v C:/SqlServer/data:/var/opt/mssql/data -v C:/SqlServer/log:/var/opt/mssql/log -v C:/SqlServer/secrets:/var/opt/mssql/secrets -v C:/SqlServer/backup:/var/opt/mssql/backup --restart unless-stopped -d mcr.microsoft.com/azure-sql-edge
```

Broken down:

- `-e` is always followed by an environment variable, in our case we need the two:
  - `ACCEPT_EULA=Y` is just as it says, it is your acceptance of the End User License Agreement with Microsoft
  - `MSSQL_SA_PASSWORD=PlaceHolder&NotARealPassword` is setting the SA password, and should be changed
- `-p 1433:1433` exposes the default port to the host OS
- `-v` maps directories inside of the container to directories on the host, and is important for persistence:
  - ...data
  - ...log
  - ...secrets
  - ...backup
- `--restart unless-stopped` tells docker to keep this container running unless it is stopped explicitly. If I were leaving one out, it would be this one, as it may cause a failure loop that would go on forever. That being said, I keep it on.
- `-d` tells docker to run the container detached (in the background)
- `azure-sql-edge` is the image we'll be running

Before you run this, you'll need to **create the folder** C:\SqlServer, or change the script to point to a directory that best meets your needs.

Mac users will have to adjust the paths, which should be easy enough.

#### Provisioning Script

`assets/DB Scripts/SQL Server/init.sql` will create a database, create tables and populate a few test tables. You'll need a login and user for the database to configure a connection.

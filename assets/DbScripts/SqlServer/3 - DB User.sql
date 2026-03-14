USE Scaff_DB
GO

IF OBJECT_ID('user_Scaff_DB') IS NOT NULL
	DROP USER user_Scaff_DB
GO

IF (SELECT SUSER_ID('user_Scaff_DB')) IS NULL
	CREATE LOGIN user_Scaff_DB WITH PASSWORD = 'Password!here'
GO

CREATE USER user_Scaff_DB FOR LOGIN user_Scaff_DB
    WITH DEFAULT_SCHEMA = dbo;  
GO  
ALTER ROLE [db_datareader] ADD MEMBER user_Scaff_DB
GO
ALTER ROLE [db_datawriter] ADD MEMBER user_Scaff_DB
GO
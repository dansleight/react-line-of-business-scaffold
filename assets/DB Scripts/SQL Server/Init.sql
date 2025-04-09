
IF NOT EXISTS (
	SELECT	1
	FROM	sys.databases
	WHERE	name = 'Scaffold'
)
BEGIN
	CREATE DATABASE Scaffold
END
GO

USE Scaffold
GO

IF OBJECT_ID('dat_User') IS NOT NULL
	DROP TABLE dat_User
GO

IF OBJECT_ID('enum_UserRole') IS NOT NULL
	DROP TABLE enum_UserRole
GO

IF OBJECT_ID('dat_Config') IS NOT NULL
	DROP TABLE dat_Config
GO

-- ******************** dat_Config ********************
CREATE TABLE dat_Config (
	ConfigKey			nvarchar(100)	NOT NULL,
	ConfigValue			nvarchar(max)	NOT NULL,
	CONSTRAINT PK_dat_Config PRIMARY KEY (ConfigKey)
)
GO

-- ******************** enum_UserRole ********************
CREATE TABLE enum_UserRole (
	Role				nvarchar(50)		NOT NULL,
	CONSTRAINT PK_enum_Role PRIMARY KEY (Role)
)
GO

INSERT enum_UserRole (Role) 
VALUES 
	(N'Admin'),
	(N'User')
GO

-- ******************** dat_User ********************
CREATE TABLE dat_User (
	Email				nvarchar(250)	NOT NULL,
	Role				nvarchar(50)	NOT NULL,
	CONSTRAINT pk_dat_User PRIMARY KEY (Email, Role),
	CONSTRAINT fk_dat_User_enum_UserRole FOREIGN KEY(Role) REFERENCES enum_UserRole (Role)
)
GO

INSERT dat_User (Email, Role) 
VALUES 
	(N'dansleight@gmail.com', N'Admin'),
	(N'dan.sleight@inl.gov', N'Admin'),
	(N'knbanner@gmail.com', N'Admin'),
	(N'keith.banner@inl.gov', N'Admin')
GO

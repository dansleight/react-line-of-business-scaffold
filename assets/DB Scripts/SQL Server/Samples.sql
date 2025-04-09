
USE Scaffold
GO

IF OBJECT_ID('br_WidgetGreenType') IS NOT NULL
	DROP TABLE br_WidgetGreenType
GO

IF OBJECT_ID('dat_Widget') IS NOT NULL
	DROP TABLE dat_Widget
GO

IF OBJECT_ID('dat_Collection') IS NOT NULL
	DROP TABLE dat_Collection
GO

IF OBJECT_ID('enum_CollectionType') IS NOT NULL
	DROP TABLE enum_CollectionType
GO

IF OBJECT_ID('lu_RedType') IS NOT NULL
	DROP TABLE lu_RedType
GO

IF OBJECT_ID('lu_GreenType') IS NOT NULL
	DROP TABLE lu_GreenType
GO

IF OBJECT_ID('lu_BlueType') IS NOT NULL
	DROP TABLE lu_BlueType
GO

IF OBJECT_ID('enum_WidgetType') IS NOT NULL
	DROP TABLE enum_WidgetType
GO

-- ******************** enum_WidgetType ********************
CREATE TABLE enum_WidgetType (
	WidgetType			nvarchar(100)	NOT NULL,
	CONSTRAINT pk_enum_WidgetType PRIMARY KEY (WidgetType)
)
GO

INSERT enum_WidgetType (WidgetType) 
VALUES 
	(N'Oval'),
	(N'Round'),
	(N'Square')
GO

-- ******************** lu_BlueType ********************
CREATE TABLE lu_BlueType (
	BlueTypeId			int				IDENTITY(1001,1) NOT NULL,
	Name				nvarchar(100)	NOT NULL,
	CONSTRAINT pl_lu_BlueType PRIMARY KEY (BlueTypeId)
)
GO

SET IDENTITY_INSERT lu_BlueType ON 
GO
INSERT lu_BlueType (BlueTypeId, Name) 
VALUES 
	(1, N'slate'),
	(2, N'sky'),
	(3, N'peacock'),
	(4, N'teal'),
	(5, N'cerulean'),
	(6, N'navy'),
	(7, N'grizz')
GO
SET IDENTITY_INSERT lu_BlueType OFF
GO

-- ******************** lu_GreenType ********************
CREATE TABLE lu_GreenType (
	GreenTypeId			int				IDENTITY(1001,1) NOT NULL,
	Name				nvarchar(100)	NOT NULL,
	CONSTRAINT pl_lu_GreenType PRIMARY KEY (GreenTypeId)
)
GO

SET IDENTITY_INSERT lu_GreenType ON 
GO
INSERT lu_GreenType (GreenTypeId, Name) 
VALUES 
	(1, N'chartreuse'),
	(2, N'juniper'),
	(3, N'fern'),
	(4, N'shamrock'),
	(5, N'mossy'),
	(6, N'moldy')
GO
SET IDENTITY_INSERT lu_GreenType OFF
GO

-- ******************** lu_RedType ********************
CREATE TABLE lu_RedType (
	RedTypeId			int				IDENTITY(1001,1) NOT NULL,
	Name				nvarchar(100)	NOT NULL,
	CONSTRAINT pl_lu_RedType PRIMARY KEY (RedTypeId)
)
GO

SET IDENTITY_INSERT lu_RedType ON 
GO
INSERT lu_RedType (RedTypeId, Name) 
VALUES 
	(1, N'cherry'),
	(2, N'rose'),
	(3, N'jam'),
	(4, N'merlot'),
	(5, N'garnet'),
	(6, N'blush'),
	(7, N'lipstick')
GO
SET IDENTITY_INSERT lu_RedType OFF
GO

-- ******************** enum_CollectionType ********************
CREATE TABLE enum_CollectionType (
	CollectionType		nvarchar(20)	NOT NULL,
	CONSTRAINT pk_enum_CollectionType PRIMARY KEY (CollectionType)
)
GO

INSERT INTO enum_CollectionType VALUES ('Default'), ('Special')
GO

-- ******************** dat_Collection ********************
CREATE TABLE dat_Collection (
	CollectionId		int				IDENTITY(1001, 1) NOT NULL,
	[Name]				nvarchar(100)	NOT NULL,
	[Description]		nvarchar(max)	NULL,
	CollectionType		nvarchar(20)	NOT NULL,
	CONSTRAINT pk_dat_Collection PRIMARY KEY (CollectionId),
	CONSTRAINT fk_dat_Collection_enum_CollectionType FOREIGN KEY (CollectionType) REFERENCES enum_CollectionType(CollectionType)
)
GO

SET IDENTITY_INSERT dat_Collection ON;
INSERT INTO dat_Collection (CollectionId, [Name], CollectionType)
VALUES
	(1, 'My Widgets', 'Default')
GO
SET IDENTITY_INSERT dat_Collection OFF;

-- ******************** dat_Widget ********************
CREATE TABLE dat_Widget (
	WidgetId			int				IDENTITY(1001,1) NOT NULL,
	CollectionId		int				NOT NULL,
	Name				nvarchar(100)	NOT NULL,
	Description			nvarchar(max)	NULL,
	WidgetType			nvarchar(100)	NOT NULL,
	RedTypeId			int				NULL,
	BlueTypeId			int				NOT NULL,
	ApprovalDate		datetime		NULL,
	CONSTRAINT pk_dat_Widget PRIMARY KEY (WidgetId),
	CONSTRAINT fk_dat_Widget_dat_Collection FOREIGN KEY (CollectionId) REFERENCES dat_Collection (CollectionId),
	CONSTRAINT fk_dat_Widget_enum_WidgetType FOREIGN KEY(WidgetType) REFERENCES enum_WidgetType (WidgetType),
	CONSTRAINT fk_dat_Widget_lu_BlueType FOREIGN KEY(BlueTypeId) REFERENCES lu_BlueType (BlueTypeId),
	CONSTRAINT fk_dat_Widget_lu_RedType FOREIGN KEY(RedTypeId) REFERENCES lu_RedType (RedTypeId)
)
GO

SET IDENTITY_INSERT dat_Widget ON 
GO
INSERT dat_Widget (WidgetId, CollectionId, Name, WidgetType, RedTypeId, BlueTypeId, ApprovalDate) 
VALUES 
	(1, 1, N'First', N'Oval', 1, 1, GETDATE())
GO
SET IDENTITY_INSERT dat_Widget OFF
GO

-- ******************** br_WidgetGreenType ********************
CREATE TABLE br_WidgetGreenType (
	WidgetId			int				NOT NULL,
	GreenTypeId			int				NOT NULL,
	CONSTRAINT pk_br_WidgetGreenType PRIMARY KEY (WidgetId, GreenTypeId),
	CONSTRAINT fk_br_WidgetGreenType_dat_Widget FOREIGN KEY(WidgetId) REFERENCES dat_Widget (WidgetId),
	CONSTRAINT fk_br_WidgetGreenType_lu_GreenType FOREIGN KEY(GreenTypeId) REFERENCES lu_GreenType (GreenTypeId)
)
GO

INSERT br_WidgetGreenType (WidgetId, GreenTypeId) 
VALUES 
	(1, 1),
	(1, 2),
	(1, 5),
	(1, 6)
GO
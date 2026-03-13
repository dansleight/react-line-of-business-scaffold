USE Scaff_DB
GO

-- ******************** dat_Log ********************
IF OBJECT_ID('dat_Log') IS NOT NULL
	DROP TABLE dat_Log
GO

CREATE TABLE dat_Log (
	Id					INT				NOT NULL IDENTITY(1001, 1),
	[Timestamp]			DATETIME2		NOT NULL,
	[Level]				NVARCHAR(50)	NOT NULL,
	[Message]			NVARCHAR(MAX)	NOT NULL,
	Logger				NVARCHAR(255)	NULL,
	Context				NVARCHAR(MAX)	NULL,
	Exception			NVARCHAR(MAX)	NULL,
	CONSTRAINT pk_dat_Log PRIMARY KEY (Id)
)
GO
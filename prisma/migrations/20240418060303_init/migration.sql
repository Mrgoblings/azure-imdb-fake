BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Movie] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [year] INT NOT NULL,
    [genre] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [director] NVARCHAR(1000) NOT NULL,
    [actors] NVARCHAR(1000) NOT NULL,
    [thumbnailUrl] NVARCHAR(1000),
    CONSTRAINT [Movie_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Rating] (
    [id] INT NOT NULL IDENTITY(1,1),
    [movieId] INT NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [opinion] NVARCHAR(1000) NOT NULL,
    [rating] INT NOT NULL,
    [date] DATETIME2 NOT NULL,
    [author] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Rating_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Rating] ADD CONSTRAINT [Rating_movieId_fkey] FOREIGN KEY ([movieId]) REFERENCES [dbo].[Movie]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

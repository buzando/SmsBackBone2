use [SMS_WEB_API]

CREATE TABLE UserAccountRecovery (
    id INT PRIMARY KEY IDENTITY(1,1),
    idUser INT NOT NULL,
    token NVARCHAR(255) NOT NULL,
    Expiration DATETIME NOT NULL,
    Type NVARCHAR(50),
    FOREIGN KEY (idUser) REFERENCES users(id)
);

CREATE TABLE clients (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombreCliente NVARCHAR(255) NOT NULL
);

CREATE TABLE Roles (
    id INT PRIMARY KEY IDENTITY(1,1),
    Role NVARCHAR(50) NOT NULL
);


CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    idCliente INT NOT NULL,
    userName VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    status bit NOT NULL,
    createDate DATETIME2 NULL,
    lastPasswordChangeDate DATETIME2 null,
    email VARCHAR(255) NOT NULL,
    emailConfirmed BIT NOT NULL,
    lockoutEndDateUtc DATETIME2 null,
    lockoutEnabled BIT NOT NULL,
    accessFailedCount INT NOT NULL,
    idRole INT NOT NULL,
    clauseAccepted BIT NOT NULL,
    phoneNumber VARCHAR(50),
    TwoFactorAuthentication BIT NOT NULL,
    SMS BIT not null,
    Call BIT not null,
    passwordHash VARCHAR(255) not null,
    SecondaryEmail VARCHAR(255) not null,
    futureRooms bit null,
    FOREIGN KEY (idCliente) REFERENCES clients(id),
    FOREIGN KEY (idRole) REFERENCES Roles(id)
);

CREATE TABLE creditcards (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    card_number VARCHAR(16) NOT NULL,
    card_name VARCHAR(255) NOT NULL,
    expiration_month tinyint not null,
    expiration_year smallint NOT NULL,
    cvv char(3) NOT NULL,
    is_default BIT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME,
    Type NVARCHAR(50),
	street NVARCHAR(255) NOT NULL, -- Calle
    exterior_number NVARCHAR(50) NOT NULL, -- Número exterior
    interior_number NVARCHAR(50) NULL, -- Número interior
    neighborhood NVARCHAR(255) NOT NULL, -- Colonia
    city NVARCHAR(255) NOT NULL, -- Ciudad
    state NVARCHAR(255) NOT NULL, -- Estado
    postal_code NVARCHAR(10) NOT NULL, -- Código postal (máx. 10 caracteres)
    FOREIGN KEY (user_id) REFERENCES users(id)
);

sp_help rooms
CREATE TABLE rooms (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    calls INT NOT NULL,
    credits float NOT NULL,
    description NVARCHAR(255),
    long_sms float,
    short_sms float
);

CREATE TABLE roomsbyuser (
    id INT PRIMARY KEY IDENTITY(1,1),
    idUser INT NOT NULL,
    idRoom INT NOT NULL,
    FOREIGN KEY (idUser) REFERENCES users(id),
    FOREIGN KEY (idRoom) REFERENCES rooms(id)
);

CREATE TABLE MyNumbers (
    id INT PRIMARY KEY IDENTITY(1,1),
    idUser INT NOT NULL,
    Number NVARCHAR(20) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Service NVARCHAR(50),
    Cost DECIMAL(10,2),
    NextPaymentDate DATETIME,
    State NVARCHAR(50),
    Municipality NVARCHAR(50),
    Lada NVARCHAR(10),
    FOREIGN KEY (idUser) REFERENCES users(id)
);


CREATE TABLE BillingInformation (
    id INT PRIMARY KEY IDENTITY(1,1),
    userId INT NOT NULL,
    businessName NVARCHAR(255) NOT NULL, -- Nombre o razón social
    taxId NVARCHAR(50) NOT NULL,        -- RFC
    taxRegime NVARCHAR(255) NOT NULL,  -- Régimen fiscal
    cfdi NVARCHAR(255) NOT NULL,       -- CFDI
    postalCode NVARCHAR(10) NOT NULL,  -- Código postal
    createdAt DATETIME NOT NULL DEFAULT GETDATE(), -- Fecha de creación
    updatedAt DATETIME NULL,           -- Fecha de última actualización
    FOREIGN KEY (userId) REFERENCES Users(id)
);

create table AmountNotification(
    id INT PRIMARY KEY IDENTITY(1,1),
	short_sms bit null,
	long_sms bit null,
	call bit null,
	AmountNotification decimal(10,2) not null,
	AutoRecharge bit null,
	AutoRechargeAmountNotification decimal(10,2) null,
	AutoRechargeAmount decimal(10,2) null,
	IdCreditcard int null, 
	foreign key (IdCreditcard) references creditcards(id)
	   )

	   create table AmountNotificationUser
	   (
	       id INT PRIMARY KEY IDENTITY(1,1),
		  userId INT NOT NULL  FOREIGN KEY (userId) REFERENCES Users(id),
		  NotificationId int not null foreign key(NotificationId) references AmountNotification(id)
	   )


Create table CreditRecharge (
id int primary key identity(1,1),
idCreditCard int not null foreign key references creditcards(id),
idUser int not null foreign key references users(id),
chanel varchar(50) not null,
quantityCredits bigint not null,
quantityMoney Decimal(10,2) not null,
RechargeDate datetime not null,
Estatus varchar(50) not null,
invoice varchar(300) null,
AutomaticInvoice bit not null,
)
alter table creditRecharge add EstatusError nvarchar(100) null

INSERT INTO Roles (Role) VALUES 
('Root'),
('Telco'),
('Administrador'),
('Supervisor'),
('Monitor');

CREATE TABLE Template (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    CreationDate DATETIME NOT NULL DEFAULT GETDATE(),
    IdRoom INT NOT NULL,
    FOREIGN KEY (IdRoom) REFERENCES Rooms(Id)
);

 
 create table BlackList (
id int identity(1,1) primary key not null,
CreationDate datetime not null,
phone nvarchar(50) not null,
Name nvarchar(100) not null,
ExpirationDate datetime null,
idroom int foreign key references rooms(id)
)

-- Tabla Campaigns
CREATE TABLE Campaigns (
    Id INT IDENTITY(1,1) PRIMARY KEY,
	RoomId int not null,
    Name NVARCHAR(255) NOT NULL,
    Message NVARCHAR(MAX) NULL,
    UseTemplate BIT DEFAULT 0,
    TemplateId INT NULL,
    AutoStart BIT DEFAULT 0,
    FlashMessage BIT DEFAULT 0,
    CustomANI BIT DEFAULT 0,
    RecycleRecords BIT DEFAULT 0,
    NumberType tinyint not NULL, -- 'Corto 1' o 'Largo 2'
    CreatedDate DATETIME DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL,
    FOREIGN KEY (TemplateId) REFERENCES Template(Id),
	foreign key (RoomId) references rooms(Id)
);

-- Tabla CampaignSchedules
CREATE TABLE CampaignSchedules (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId INT NOT NULL,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    OperationMode tinyint NULL, -- 'Reanudar 1' o 'Reciclar 2'
    [Order] INT NOT NULL,
    FOREIGN KEY (CampaignId) REFERENCES Campaigns(Id)
);

-- Tabla CampaignContacts
CREATE TABLE CampaignContacts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId INT NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(40) NULL,
	DatoId nvarchar(40) NULL,
	Misc01 nvarchar(30) NULL,
	Misc02 nvarchar(30) NULL,
    FOREIGN KEY (CampaignId) REFERENCES Campaigns(Id)
);

CREATE TABLE CampaignContactsTemp (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SessionId UNIQUEIDENTIFIER NOT NULL, -- lo generas en frontend
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(40) NULL,
    DatoId NVARCHAR(40) NULL,
    Misc01 NVARCHAR(30) NULL,
    Misc02 NVARCHAR(30) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Tabla CampaignRecycleSettings
CREATE TABLE CampaignRecycleSettings (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId INT NOT NULL,
    TypeOfRecords NVARCHAR(20) NULL, -- 'Todos' o 'Rechazados'
    IncludeNotContacted BIT DEFAULT 0,
    NumberOfRecycles INT DEFAULT 0,
    FOREIGN KEY (CampaignId) REFERENCES Campaigns(Id)
);

-- Tabla CampaignBlacklist
CREATE TABLE blacklistcampains (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    idcampains INT NOT NULL,
    idblacklist INT NOT NULL,
    FOREIGN KEY (idcampains) REFERENCES Campaigns(Id),
    FOREIGN KEY (idblacklist) REFERENCES BlackList(Id)
);


CREATE TABLE client_access (
    id INT PRIMARY KEY IDENTITY(1,1),
    client_id INT NOT NULL FOREIGN KEY REFERENCES clients(id),
    username NVARCHAR(100) NOT NULL,
    password NVARCHAR(300) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    status BIT NOT NULL DEFAULT 1 -- activo/inactivo
);

CREATE TABLE tpm_CampaignContacts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    SessionId NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(100) NULL,
    DatoId NVARCHAR(100) NULL,
    Misc01 NVARCHAR(100) NULL,
    Misc02 NVARCHAR(100) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NULL
);
CREATE TABLE CampaignContactScheduleSend (
    Id INT PRIMARY KEY IDENTITY,
    CampaignId INT NOT NULL,
    ContactId INT NOT NULL,
    ScheduleId INT NOT NULL,
    SentAt DATETIME NULL,
    Status VARCHAR(50) NOT NULL, -- 'Pendiente', 'Enviado', 'Error', etc.
    ResponseMessage NVARCHAR(255) NULL,
    FOREIGN KEY (CampaignId) REFERENCES Campaigns(Id),
    FOREIGN KEY (ContactId) REFERENCES CampaignContacts(Id),
    FOREIGN KEY (ScheduleId) REFERENCES CampaignSchedules(Id)
);


alter table campaigns add StartDate DATETIME null
alter table campaigns add concatenate Bit not null default 0
alter table campaigns add shortenUrls Bit not null default 0

alter table campaigns drop column concatenate

alter table campaigns add ShouldConcatenate Bit not null default 0
alter table campaigns add ShouldShortenUrls Bit not null default 0

CREATE TABLE IFTLadas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ClaveLada VARCHAR(5) NOT NULL, 
    Estado VARCHAR(100) NOT NULL,          
    Municipio VARCHAR(150) NOT NULL,       
    FechaCarga DATETIME DEFAULT GETDATE()   
);


Alter table CampaignContactScheduleSend add State nvarchar(50)

CREATE TABLE CreditRechargeOpenPay (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    idopenpay NVARCHAR(140) NOT NULL,
    IdCreditRecharge INT NULL,
    ChargeId NVARCHAR(200) NOT NULL,
    BankAuthorization NVARCHAR(200) NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Status NVARCHAR(100) NOT NULL,
    CreationDate DATETIME NOT NULL,
    CardId NVARCHAR(200) NULL,
    CustomerId NVARCHAR(200) NULL,
    Conciliated BIT NOT NULL,
    Description NVARCHAR(600) NULL
);

alter table creditrecharge add EstatusError nvarchar(100) null 


-- 1. Agregar la nueva columna
ALTER TABLE AmountNotification
ADD IdRoom INT;

-- 2. Crear la relación foránea
ALTER TABLE AmountNotification
ADD CONSTRAINT FK_AmountNotification_Rooms
FOREIGN KEY (IdRoom)
REFERENCES Rooms(id);

ALTER TABLE MyNumbers
DROP CONSTRAINT FK__MyNumbers__idUse__4AB81AF0;

EXEC sp_rename 'MyNumbers.idUser', 'idClient', 'COLUMN';

ALTER TABLE MyNumbers
ADD CONSTRAINT FK_MyNumbers_idClient
FOREIGN KEY (idClient)
REFERENCES clients(id);

-- Paso 1: Eliminar la FK actual
ALTER TABLE MyNumbers
DROP CONSTRAINT FK_MyNumbers_idClient;

-- Paso 2: Asegurarte que la columna acepte NULLs
ALTER TABLE MyNumbers
ALTER COLUMN idClient INT NULL;

-- Paso 3: Volver a crear la FK
ALTER TABLE MyNumbers
ADD CONSTRAINT FK_MyNumbers_idClient
FOREIGN KEY (idClient)
REFERENCES clients(id);


alter table clients add CreationDate datetime not null default GETDATE()
alter table clients add RateForShort decimal (10,2) null
alter table clients add RateForLong decimal (10,2) null
alter table clients add Estatus tinyint 

sp_help CreditRecharge
select * from clients

ALTER TABLE CreditRecharge
DROP CONSTRAINT FK__CreditRec__idCre__5812160E;

ALTER TABLE CreditRecharge
ALTER COLUMN idCreditCard INT NULL;

ALTER TABLE CreditRecharge
ADD CONSTRAINT FK_CreditRecharge_idCreditCard
FOREIGN KEY (idCreditCard) REFERENCES creditcards(id);

USE [SMS_WEB_API]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetCampaignsByRoom]    Script Date: 6/23/2025 12:24:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
Create PROCEDURE [dbo].[sp_GetCampaignsByRoom]
    @RoomId INT,
	 @SmsType NVARCHAR(10) = NULL
AS
BEGIN
    SET NOCOUNT ON;

	  DECLARE @TypeNumber INT = NULL;

    -- Convertimos el tipo de SMS a número si aplica
    SET @TypeNumber = CASE 
                        WHEN @SmsType = 'short' THEN 1
                        WHEN @SmsType = 'long' THEN 2
                        ELSE NULL
                      END;
    -- Resultset 1: Info general de la campaña
    SELECT 
        c.Id,
        c.Name,
        c.Message,
        c.UseTemplate,
        c.TemplateId,
        c.AutoStart,
        c.FlashMessage,
        c.CustomANI,
        c.RecycleRecords,
        c.NumberType,
        c.CreatedDate,
        c.StartDate,
		0 AS BlockedRecords,
		0 AS DeliveryFailRate,
		0 AS OutOfScheduleRecords,
0 AS NoReceptionRate,
0 AS WaitRate,
0 AS RejectionRate,
0 AS NoSendRate,
0 AS ExceptionRate,
0 AS ReceptionRate,
        (SELECT COUNT(*) FROM CampaignContacts cc WHERE cc.CampaignId = c.Id) AS ContactCount,
        (SELECT COUNT(*) FROM CampaignSchedules s WHERE s.CampaignId = c.Id AND s.OperationMode = 2 AND s.EndDateTime <= GETDATE()) AS RecycleCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id) AS numeroActual,

        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.ResponseMessage IS NOT NULL) AS RespondedRecords,

        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '0') AS InProcessCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '1') AS DeliveredCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '2') AS NotDeliveredCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '3') AS NotSentCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '4') AS FailedCount,
        (SELECT COUNT(*) FROM CampaignContactScheduleSend s WHERE s.CampaignId = c.Id AND s.Status = '5') AS ExceptionCount,

        -- númeroInicial según regla de duplicados
        (
            CASE 
                WHEN (SELECT COUNT(*) FROM CampaignSchedules s WHERE s.CampaignId = c.Id AND s.OperationMode = 2 AND s.EndDateTime <= GETDATE()) > 1
                THEN (SELECT COUNT(*) FROM CampaignContacts cc WHERE cc.CampaignId = c.Id) *
                     (SELECT COUNT(*) FROM CampaignSchedules s WHERE s.CampaignId = c.Id AND s.OperationMode = 2 AND s.EndDateTime <= GETDATE())
                ELSE (SELECT COUNT(*) FROM CampaignContacts cc WHERE cc.CampaignId = c.Id)
            END
        ) AS numeroInicial

    FROM Campaigns c
    WHERE c.RoomId = @RoomId
	 AND (@TypeNumber IS NULL OR c.NumberType = @TypeNumber);
    -- Resultset 2: Schedules
    SELECT 
        s.CampaignId,
        s.StartDateTime,
        s.EndDateTime,
        s.OperationMode,
        s.[Order]
    FROM CampaignSchedules s
    INNER JOIN Campaigns c ON c.Id = s.CampaignId
    WHERE c.RoomId = @RoomId;

    -- Resultset 3: RecycleSetting
    SELECT 
        r.CampaignId,
        r.TypeOfRecords,
        r.IncludeNotContacted,
        r.NumberOfRecycles
    FROM CampaignRecycleSettings r
    INNER JOIN Campaigns c ON c.Id = r.CampaignId
    WHERE c.RoomId = @RoomId;

    -- Resultset 4: Contacts
    SELECT 
        cc.CampaignId,
        cc.PhoneNumber,
        cc.Dato,
        cc.DatoId,
        cc.Misc01,
        cc.Misc02
    FROM CampaignContacts cc
    INNER JOIN Campaigns c ON c.Id = cc.CampaignId
    WHERE c.RoomId = @RoomId;

    -- Resultset 5: ContactScheduleSend
    SELECT 
        s.Id,
        s.CampaignId,
        s.ContactId,
        s.ScheduleId,
        s.SentAt,
        s.Status,
        s.ResponseMessage,
        s.State
    FROM CampaignContactScheduleSend s
    INNER JOIN Campaigns c ON c.Id = s.CampaignId
    WHERE c.RoomId = @RoomId;

END

CREATE OR ALTER PROCEDURE sp_getGlobalReport
    @StartDate DATETIME,
    @EndDate DATETIME,
    @RoomId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        cc.SentAt AS [Date],
        cct.PhoneNumber AS Phone,
        r.name AS Room,
        cp.Name AS Campaign,
        cp.Id AS CampaignId,
        u.userName AS [User],
        cc.Id AS MessageId,
        ISNULL(cp.Message, t.Message) AS Message,
        cc.Status,
        cc.SentAt AS ReceivedAt,
        FORMAT(
            CASE 
                WHEN mn.Type = 'long' THEN cl.RateForLong
                ELSE cl.RateForShort
            END, 'C', 'es-MX'
        ) AS Cost,
        CASE 
            WHEN cp.NumberType = 1 THEN 'Número corto'
            WHEN cp.NumberType = 2 THEN 'Número largo'
            ELSE 'Desconocido'
        END AS Type
    FROM Campaigns cp
    INNER JOIN CampaignContacts cct ON cp.Id = cct.CampaignId
    INNER JOIN CampaignContactScheduleSend cc ON cc.ContactId = cct.Id
    LEFT JOIN Template t ON cp.TemplateId = t.Id
    INNER JOIN rooms r ON cp.RoomId = r.id
    LEFT JOIN roomsbyuser ru ON ru.idRoom = r.id
    LEFT JOIN users u ON ru.idUser = u.id
    LEFT JOIN clients cl ON u.idCliente = cl.id
    LEFT JOIN MyNumbers mn ON mn.Number = cct.PhoneNumber AND mn.idClient = cl.id
    WHERE cp.RoomId = @RoomId
      AND cc.SentAt BETWEEN @StartDate AND @EndDate
    ORDER BY cc.SentAt DESC;
END



DECLARE @StartDate DATETIME = '2024-07-01 00:00:00';
DECLARE @EndDate DATETIME = '2025-07-31 23:59:59';
DECLARE @RoomId INT = 1;

CREATE or ALTER PROCEDURE sp_getSmsDeliveryReport
    @StartDate DATETIME,
    @EndDate DATETIME,
    @RoomId INT,
    @ReportType NVARCHAR(20), -- 'entrantes', 'enviados', 'noenviados', 'rechazados'
    @UserIds NVARCHAR(MAX) = NULL,
    @CampaignIds NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Convertir listas separadas por comas a tablas
    DECLARE @UserIdTable TABLE (Id INT);
    DECLARE @CampaignIdTable TABLE (Id INT);

    IF @UserIds IS NOT NULL AND @UserIds <> ''
    BEGIN
        INSERT INTO @UserIdTable (Id)
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@UserIds, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;
    END

    IF @CampaignIds IS NOT NULL AND @CampaignIds <> ''
    BEGIN
        INSERT INTO @CampaignIdTable (Id)
        SELECT CAST(value AS INT)
        FROM STRING_SPLIT(@CampaignIds, ',')
        WHERE TRY_CAST(value AS INT) IS NOT NULL;
    END

    SELECT 
        ccs.Id AS MessageId,
        c.Message,
        c.Name AS CampaignName,
        c.Id AS CampaignId,
		u.id as UserId,
        u.userName AS UserName,
        r.name AS RoomName,
        cc.PhoneNumber,
        ccs.Status,
        ccs.ResponseMessage,
        ccs.SentAt
    FROM CampaignContactScheduleSend ccs
    INNER JOIN Campaigns c ON c.Id = ccs.CampaignId
    INNER JOIN Rooms r ON r.Id = c.RoomId
    INNER JOIN CampaignContacts cc ON cc.Id = ccs.ContactId
    INNER JOIN Roomsbyuser ru ON ru.idRoom = r.Id
    INNER JOIN Users u ON u.id = ru.idUser
    WHERE 
        c.RoomId = @RoomId
        AND ccs.SentAt BETWEEN @StartDate AND @EndDate
        AND (
            @UserIds IS NULL OR u.id IN (SELECT Id FROM @UserIdTable)
        )
        AND (
            @CampaignIds IS NULL OR c.Id IN (SELECT Id FROM @CampaignIdTable)
        )
        AND (
            (@ReportType = 'entrantes' AND ccs.ResponseMessage IS NOT NULL)
            OR (@ReportType = 'enviados' AND ccs.Status = '0')
            OR (@ReportType = 'noenviados' AND ccs.Status = '3')
            OR (@ReportType = 'rechazados' AND ccs.Status IN ('2','4','5'))
        )
    ORDER BY ccs.SentAt DESC;
END

DECLARE @StartDate DATETIME = '2024-07-01 00:00:00';
DECLARE @EndDate DATETIME = '2025-07-31 23:59:59';
DECLARE @RoomId INT = 1;
DECLARE @ReportType NVARCHAR(20) = 'enviados'; -- puedes probar con 'entrantes', 'enviados', 'noenviados', 'rechazados'
DECLARE @UserIds NVARCHAR(MAX) = NULL;
DECLARE @CampaignIds NVARCHAR(MAX) = NULL;


EXEC sp_getSmsDeliveryReport
    @StartDate,
    @EndDate,
    @RoomId,
    @ReportType,
    @UserIds,
    @CampaignIds;


CREATE OR ALTER PROCEDURE sp_getCampaignsToAutoStart
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @now DATETIME = GETDATE();

    SELECT
        c.Id AS CampaignId,
        c.Name,
        c.Message,
        c.UseTemplate,
        c.TemplateId,
        c.AutoStart,
        c.FlashMessage,
        c.CustomANI,
        c.RecycleRecords,
        c.NumberType,
        c.CreatedDate,
        c.RoomId,
        r.Name AS RoomName,
        r.Description AS RoomDescription,
        r.Credits,
        r.Long_Sms,
        r.Short_Sms,
        ca.username,
        ca.password,
        cl.RateForShort,
        cl.RateForLong,
        r.credits,
        r.long_sms,
        r.short_sms,
        sch.Id AS ScheduleId,
        sch.StartDateTime,
        sch.EndDateTime,
        (
            SELECT STRING_AGG(CAST(bc.idblacklist AS VARCHAR), ',')
            FROM blacklistcampains bc
            WHERE bc.idcampains = c.Id
        ) AS BlackListIds
    FROM Campaigns c
    INNER JOIN Rooms r ON r.id = c.RoomId
    INNER JOIN roomsbyuser rbu ON rbu.idRoom = r.id
    INNER JOIN Users u ON u.Id = rbu.idUser
    INNER JOIN Clients cl ON cl.id = u.IdCliente AND cl.Estatus = 0
    INNER JOIN client_access ca ON ca.client_id = cl.id
    OUTER APPLY (
        SELECT TOP 1 s.*
        FROM CampaignSchedules s
        WHERE s.CampaignId = c.Id
          AND s.StartDateTime <= GETDATE()
          AND s.EndDateTime >= GETDATE()
        ORDER BY s.StartDateTime
    ) sch
    WHERE c.AutoStart = 1
      AND EXISTS (
          SELECT 1
          FROM CampaignSchedules s
          WHERE s.CampaignId = c.Id
            AND s.StartDateTime <= @now
            AND s.EndDateTime >= @now
      );
END

select * from blacklistcampains

select * from CampaignContacts

select * from CampaignSchedules
/* 
    Portal Quantum - Script limpio de creación de base de datos
    Base: SMS_WEB_API
    Tipo: baseline para base nueva

    Este script consolida el esquema de tablas y columnas finales.
    Se removieron consultas de prueba, comandos de diagnóstico, updates manuales y cambios estructurales sueltos.

    IMPORTANTE:
    - Ejecutar primero en ambiente de pruebas.
    - No ejecutar directamente sobre producción sin respaldo.
    - Este script está pensado para CREAR esquema desde cero.
*/

USE [SMS_WEB_API];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

/* ============================================================
   01. Seguridad, clientes y usuarios
   ============================================================ */

CREATE TABLE dbo.clients
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    nombreCliente NVARCHAR(255) NOT NULL,
    CreationDate DATETIME NOT NULL CONSTRAINT DF_clients_CreationDate DEFAULT GETDATE(),
    RateForShort DECIMAL(10,2) NULL,
    RateForLong DECIMAL(10,2) NULL,
    Estatus TINYINT NULL
);
GO

CREATE TABLE dbo.Roles
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Role] NVARCHAR(50) NOT NULL
);
GO

CREATE TABLE dbo.users
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idCliente INT NOT NULL,
    userName VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    [status] BIT NOT NULL,
    createDate DATETIME2 NULL,
    lastPasswordChangeDate DATETIME2 NULL,
    email VARCHAR(255) NOT NULL,
    emailConfirmed BIT NOT NULL,
    lockoutEndDateUtc DATETIME2 NULL,
    lockoutEnabled BIT NOT NULL,
    accessFailedCount INT NOT NULL,
    idRole INT NOT NULL,
    clauseAccepted BIT NOT NULL,
    phoneNumber VARCHAR(50) NULL,
    TwoFactorAuthentication BIT NOT NULL,
    SMS BIT NOT NULL,
    [Call] BIT NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    SecondaryEmail VARCHAR(255) NOT NULL,
    futureRooms BIT NULL,

    CONSTRAINT FK_users_clients
        FOREIGN KEY (idCliente) REFERENCES dbo.clients(id),

    CONSTRAINT FK_users_Roles
        FOREIGN KEY (idRole) REFERENCES dbo.Roles(id)
);
GO

CREATE TABLE dbo.UserAccountRecovery
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idUser INT NOT NULL,
    token NVARCHAR(255) NOT NULL,
    Expiration DATETIME NOT NULL,
    [Type] NVARCHAR(50) NULL,

    CONSTRAINT FK_UserAccountRecovery_users
        FOREIGN KEY (idUser) REFERENCES dbo.users(id)
);
GO

CREATE TABLE dbo.client_access
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    client_id INT NOT NULL,
    username NVARCHAR(100) NOT NULL,
    [password] NVARCHAR(300) NOT NULL,
    created_at DATETIME NOT NULL CONSTRAINT DF_client_access_created_at DEFAULT GETDATE(),
    [status] BIT NOT NULL CONSTRAINT DF_client_access_status DEFAULT 1,
    id_backbone INT NULL,

    CONSTRAINT FK_client_access_clients
        FOREIGN KEY (client_id) REFERENCES dbo.clients(id)
);
GO

/* ============================================================
   02. Salas, relación usuario-sala y números
   ============================================================ */

CREATE TABLE dbo.rooms
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [name] NVARCHAR(255) NOT NULL,
    calls INT NOT NULL,
    credits FLOAT NOT NULL,
    [description] NVARCHAR(255) NULL,
    long_sms FLOAT NULL,
    short_sms FLOAT NULL
);
GO

CREATE TABLE dbo.roomsbyuser
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idUser INT NOT NULL,
    idRoom INT NOT NULL,

    CONSTRAINT FK_roomsbyuser_users
        FOREIGN KEY (idUser) REFERENCES dbo.users(id),

    CONSTRAINT FK_roomsbyuser_rooms
        FOREIGN KEY (idRoom) REFERENCES dbo.rooms(id)
);
GO

CREATE TABLE dbo.MyNumbers
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idClient INT NULL,
    Number NVARCHAR(20) NOT NULL,
    [Type] NVARCHAR(50) NOT NULL,
    [Service] NVARCHAR(50) NULL,
    Cost DECIMAL(10,2) NULL,
    NextPaymentDate DATETIME NULL,
    [State] NVARCHAR(50) NULL,
    Municipality NVARCHAR(50) NULL,
    Lada NVARCHAR(10) NULL,

    CONSTRAINT FK_MyNumbers_idClient
        FOREIGN KEY (idClient) REFERENCES dbo.clients(id)
);
GO

/* ============================================================
   03. Pagos, recargas, facturación y notificaciones
   ============================================================ */

CREATE TABLE dbo.creditcards
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    card_number VARCHAR(16) NOT NULL,
    card_name VARCHAR(255) NOT NULL,
    expiration_month TINYINT NOT NULL,
    expiration_year SMALLINT NOT NULL,
    cvv CHAR(3) NOT NULL,
    is_default BIT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    [Type] NVARCHAR(50) NULL,
    street NVARCHAR(255) NOT NULL,
    exterior_number NVARCHAR(50) NOT NULL,
    interior_number NVARCHAR(50) NULL,
    neighborhood NVARCHAR(255) NOT NULL,
    city NVARCHAR(255) NOT NULL,
    [state] NVARCHAR(255) NOT NULL,
    postal_code NVARCHAR(10) NOT NULL,

    CONSTRAINT FK_creditcards_users
        FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);
GO

CREATE TABLE dbo.BillingInformation
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    userId INT NOT NULL,
    businessName NVARCHAR(255) NOT NULL,
    taxId NVARCHAR(50) NOT NULL,
    taxRegime NVARCHAR(255) NOT NULL,
    cfdi NVARCHAR(255) NOT NULL,
    postalCode NVARCHAR(10) NOT NULL,
    createdAt DATETIME NOT NULL CONSTRAINT DF_BillingInformation_createdAt DEFAULT GETDATE(),
    updatedAt DATETIME NULL,

    CONSTRAINT FK_BillingInformation_users
        FOREIGN KEY (userId) REFERENCES dbo.users(id)
);
GO

CREATE TABLE dbo.AmountNotification
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    short_sms BIT NULL,
    long_sms BIT NULL,
    [call] BIT NULL,
    [AmountNotification] DECIMAL(10,2) NOT NULL,
    AutoRecharge BIT NULL,
    AutoRechargeAmountNotification DECIMAL(10,2) NULL,
    AutoRechargeAmount DECIMAL(10,2) NULL,
    IdCreditcard INT NULL,
    IdRoom INT NULL,

    CONSTRAINT FK_AmountNotification_creditcards
        FOREIGN KEY (IdCreditcard) REFERENCES dbo.creditcards(id),

    CONSTRAINT FK_AmountNotification_Rooms
        FOREIGN KEY (IdRoom) REFERENCES dbo.rooms(id)
);
GO

CREATE TABLE dbo.AmountNotificationUser
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    userId INT NOT NULL,
    NotificationId INT NOT NULL,

    CONSTRAINT FK_AmountNotificationUser_users
        FOREIGN KEY (userId) REFERENCES dbo.users(id),

    CONSTRAINT FK_AmountNotificationUser_AmountNotification
        FOREIGN KEY (NotificationId) REFERENCES dbo.AmountNotification(id)
);
GO

CREATE TABLE dbo.CreditRecharge
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idCreditCard INT NULL,
    idUser INT NOT NULL,
    chanel VARCHAR(50) NOT NULL,
    quantityCredits BIGINT NOT NULL,
    quantityMoney DECIMAL(10,2) NOT NULL,
    RechargeDate DATETIME NOT NULL,
    Estatus VARCHAR(50) NOT NULL,
    EstatusError NVARCHAR(100) NULL,
    invoice VARCHAR(300) NULL,
    AutomaticInvoice BIT NOT NULL,

    CONSTRAINT FK_CreditRecharge_idCreditCard
        FOREIGN KEY (idCreditCard) REFERENCES dbo.creditcards(id),

    CONSTRAINT FK_CreditRecharge_users
        FOREIGN KEY (idUser) REFERENCES dbo.users(id)
);
GO

CREATE TABLE dbo.CreditRechargeOpenPay
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idopenpay NVARCHAR(140) NOT NULL,
    IdCreditRecharge INT NULL,
    ChargeId NVARCHAR(200) NOT NULL,
    BankAuthorization NVARCHAR(200) NULL,
    Amount DECIMAL(10,2) NOT NULL,
    [Status] NVARCHAR(100) NOT NULL,
    CreationDate DATETIME NOT NULL,
    CardId NVARCHAR(200) NULL,
    CustomerId NVARCHAR(200) NULL,
    Conciliated BIT NOT NULL,
    [Description] NVARCHAR(600) NULL
);
GO

CREATE TABLE dbo.FacturaResumen
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UUID UNIQUEIDENTIFIER NOT NULL UNIQUE,
    Serie NVARCHAR(25) NULL,
    Folio NVARCHAR(40) NULL,
    FechaEmision DATETIME2(0) NOT NULL,
    Subtotal DECIMAL(18,6) NOT NULL,
    IVA DECIMAL(18,6) NULL,
    Total DECIMAL(18,6) NOT NULL,
    UrlXml NVARCHAR(500) NULL,
    UrlPdf NVARCHAR(500) NULL,
    Origen NVARCHAR(50) NULL CONSTRAINT DF_FacturaResumen_Origen DEFAULT 'Villanett',
    FechaRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_FacturaResumen_FechaRegistro DEFAULT SYSUTCDATETIME(),
    RechargeId INT NOT NULL,

    CONSTRAINT FK_FacturaResumen_CreditRecharge
        FOREIGN KEY (RechargeId) REFERENCES dbo.CreditRecharge(id)
);
GO

CREATE INDEX IX_FacturaResumen_RechargeId ON dbo.FacturaResumen(RechargeId);
GO
CREATE INDEX IX_FacturaResumen_Fecha ON dbo.FacturaResumen(FechaEmision);
GO

/* ============================================================
   04. Campañas, contactos, plantillas y envíos SMS
   ============================================================ */

CREATE TABLE dbo.Template
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [Message] NVARCHAR(MAX) NOT NULL,
    CreationDate DATETIME NOT NULL CONSTRAINT DF_Template_CreationDate DEFAULT GETDATE(),
    IdRoom INT NOT NULL,

    CONSTRAINT FK_Template_rooms
        FOREIGN KEY (IdRoom) REFERENCES dbo.rooms(id)
);
GO

CREATE TABLE dbo.BlackList
(
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CreationDate DATETIME NOT NULL,
    phone NVARCHAR(50) NOT NULL,
    [Name] NVARCHAR(100) NOT NULL,
    ExpirationDate DATETIME NULL,
    idroom INT NULL,

    CONSTRAINT FK_BlackList_rooms
        FOREIGN KEY (idroom) REFERENCES dbo.rooms(id)
);
GO

CREATE TABLE dbo.Campaigns
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    RoomId INT NOT NULL,
    [Name] NVARCHAR(255) NOT NULL,
    [Message] NVARCHAR(MAX) NULL,
    UseTemplate BIT CONSTRAINT DF_Campaigns_UseTemplate DEFAULT 0,
    TemplateId INT NULL,
    AutoStart BIT CONSTRAINT DF_Campaigns_AutoStart DEFAULT 0,
    FlashMessage BIT CONSTRAINT DF_Campaigns_FlashMessage DEFAULT 0,
    CustomANI BIT CONSTRAINT DF_Campaigns_CustomANI DEFAULT 0,
    RecycleRecords BIT CONSTRAINT DF_Campaigns_RecycleRecords DEFAULT 0,
    NumberType TINYINT NOT NULL,
    CreatedDate DATETIME CONSTRAINT DF_Campaigns_CreatedDate DEFAULT GETDATE(),
    ModifiedDate DATETIME NULL,
    StartDate DATETIME NULL,
    ShouldConcatenate BIT NOT NULL CONSTRAINT DF_Campaigns_ShouldConcatenate DEFAULT 0,
    ShouldShortenUrls BIT NOT NULL CONSTRAINT DF_Campaigns_ShouldShortenUrls DEFAULT 0,

    CONSTRAINT FK_Campaigns_Template
        FOREIGN KEY (TemplateId) REFERENCES dbo.Template(Id),

    CONSTRAINT FK_Campaigns_rooms
        FOREIGN KEY (RoomId) REFERENCES dbo.rooms(id)
);
GO

CREATE TABLE dbo.CampaignSchedules
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CampaignId INT NOT NULL,
    StartDateTime DATETIME NOT NULL,
    EndDateTime DATETIME NOT NULL,
    OperationMode TINYINT NULL,
    [Order] INT NOT NULL,

    CONSTRAINT FK_CampaignSchedules_Campaigns
        FOREIGN KEY (CampaignId) REFERENCES dbo.Campaigns(Id)
);
GO

CREATE TABLE dbo.CampaignContacts
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CampaignId INT NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(40) NULL,
    DatoId NVARCHAR(40) NULL,
    Misc01 NVARCHAR(30) NULL,
    Misc02 NVARCHAR(30) NULL,
    CP VARCHAR(5) NULL,

    CONSTRAINT FK_CampaignContacts_Campaigns
        FOREIGN KEY (CampaignId) REFERENCES dbo.Campaigns(Id)
);
GO

CREATE TABLE dbo.CampaignContactsTemp
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SessionId UNIQUEIDENTIFIER NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(40) NULL,
    DatoId NVARCHAR(40) NULL,
    Misc01 NVARCHAR(30) NULL,
    Misc02 NVARCHAR(30) NULL,
    CreatedAt DATETIME CONSTRAINT DF_CampaignContactsTemp_CreatedAt DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.tpm_CampaignContacts
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SessionId NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Dato NVARCHAR(100) NULL,
    DatoId NVARCHAR(100) NULL,
    Misc01 NVARCHAR(100) NULL,
    Misc02 NVARCHAR(100) NULL,
    CP VARCHAR(5) NULL,
    CreatedAt DATETIME CONSTRAINT DF_tpm_CampaignContacts_CreatedAt DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100) NULL
);
GO

CREATE INDEX IX_tpm_CampaignContacts_SessionId
ON dbo.tpm_CampaignContacts(SessionId);
GO

CREATE TABLE dbo.CampaignRecycleSettings
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CampaignId INT NOT NULL,
    TypeOfRecords NVARCHAR(20) NULL,
    IncludeNotContacted BIT CONSTRAINT DF_CampaignRecycleSettings_IncludeNotContacted DEFAULT 0,
    NumberOfRecycles INT CONSTRAINT DF_CampaignRecycleSettings_NumberOfRecycles DEFAULT 0,

    CONSTRAINT FK_CampaignRecycleSettings_Campaigns
        FOREIGN KEY (CampaignId) REFERENCES dbo.Campaigns(Id)
);
GO

CREATE TABLE dbo.blacklistcampains
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    idcampains INT NOT NULL,
    idblacklist INT NOT NULL,

    CONSTRAINT FK_blacklistcampains_Campaigns
        FOREIGN KEY (idcampains) REFERENCES dbo.Campaigns(Id),

    CONSTRAINT FK_blacklistcampains_BlackList
        FOREIGN KEY (idblacklist) REFERENCES dbo.BlackList(id)
);
GO

CREATE TABLE dbo.CampaignContactScheduleSend
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CampaignId INT NOT NULL,
    ContactId INT NOT NULL,
    ScheduleId INT NOT NULL,
    SentAt DATETIME NULL,
    [Status] VARCHAR(50) NOT NULL,
    ResponseMessage NVARCHAR(255) NULL,
    [State] NVARCHAR(50) NULL,
    ResponseDate DATETIME NULL,
    IdBackBone NVARCHAR(30) NULL,

    CONSTRAINT FK_CampaignContactScheduleSend_Campaigns
        FOREIGN KEY (CampaignId) REFERENCES dbo.Campaigns(Id),

    CONSTRAINT FK_CampaignContactScheduleSend_CampaignContacts
        FOREIGN KEY (ContactId) REFERENCES dbo.CampaignContacts(Id),

    CONSTRAINT FK_CampaignContactScheduleSend_CampaignSchedules
        FOREIGN KEY (ScheduleId) REFERENCES dbo.CampaignSchedules(Id)
);
GO

CREATE TABLE dbo.TestMessage
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ToNumber NVARCHAR(20) NOT NULL,
    FromNumber NVARCHAR(20) NULL,
    [Message] NVARCHAR(500) NULL,
    TemplateId INT NULL,
    UserId INT NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    ResponseMessage NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL CONSTRAINT DF_TestMessage_CreatedAt DEFAULT GETDATE()
);
GO

/* ============================================================
   05. Ladas, códigos postales y zona horaria
   ============================================================ */

CREATE TABLE dbo.IFTLadas
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ClaveLada VARCHAR(5) NOT NULL,
    Estado VARCHAR(100) NOT NULL,
    Municipio VARCHAR(150) NOT NULL,
    FechaCarga DATETIME CONSTRAINT DF_IFTLadas_FechaCarga DEFAULT GETDATE()
);
GO

CREATE TABLE dbo.ccTimeZones
(
    tz_id INT NOT NULL PRIMARY KEY,
    tz_name VARCHAR(20) NOT NULL,
    tz_offset DECIMAL(4,1) NOT NULL
);
GO

CREATE TABLE dbo.ccTimeZoneAreaCP
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ZipCode VARCHAR(10) NOT NULL,
    [State] VARCHAR(10) NOT NULL,
    Municipality VARCHAR(20) NULL,
    [Location] VARCHAR(20) NULL,
    StartDate DATETIME NULL,
    [Description] VARCHAR(100) NULL,
    StartMonthSummerTime INT NULL,
    StartDaySummerTime INT NULL,
    SummerTimeDifference DECIMAL(4,1) NULL,
    StartMonthWinterHours INT NULL,
    StartDayWinterHours INT NULL,
    WinterTimeDifference DECIMAL(4,1) NULL,
    tz_id INT NULL
);
GO

CREATE INDEX IX_ccTimeZoneAreaCP_ZipCode
ON dbo.ccTimeZoneAreaCP(ZipCode);
GO

CREATE INDEX IX_ccTimeZoneAreaCP_State
ON dbo.ccTimeZoneAreaCP([State]);
GO

CREATE TABLE dbo.ccPhoneSeriesMX
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ClaveCensal VARCHAR(20) NULL,
    Poblacion VARCHAR(150) NULL,
    Municipio VARCHAR(150) NULL,
    Estado VARCHAR(10) NOT NULL,
    Cld INT NOT NULL,
    Serie INT NOT NULL,
    NumeracionInicial INT NOT NULL,
    NumeracionFinal INT NOT NULL,
    TipoRed VARCHAR(20) NULL,
    Modalidad VARCHAR(20) NULL,
    RazonSocial VARCHAR(200) NULL
);
GO

CREATE INDEX IX_ccPhoneSeriesMX_Search
ON dbo.ccPhoneSeriesMX(Cld, Serie, NumeracionInicial, NumeracionFinal);
GO

CREATE INDEX IX_ccPhoneSeriesMX_Estado
ON dbo.ccPhoneSeriesMX(Estado);
GO

CREATE TABLE dbo.ccStateCodeMap
(
    Id INT IDENTITY(1,1) NOT NULL,
    SourceSystem VARCHAR(30) NOT NULL,
    SourceState VARCHAR(20) NOT NULL,
    TargetState VARCHAR(20) NOT NULL,
    StateName VARCHAR(100) NULL,

    CONSTRAINT PK_ccStateCodeMap PRIMARY KEY CLUSTERED (Id)
);
GO

CREATE INDEX IX_ccStateCodeMap_Source
ON dbo.ccStateCodeMap(SourceSystem, SourceState);
GO

/* ============================================================
   06. Conciliación de saldos
   ============================================================ */

CREATE TABLE dbo.SmsBalanceReconciliation
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ClientId INT NOT NULL,
    AccessId INT NOT NULL,
    FechaRevision DATE NOT NULL,
    BackboneCredit DECIMAL(18,2) NOT NULL,
    PortalShortBefore DECIMAL(18,2) NOT NULL,
    PortalLongBefore DECIMAL(18,2) NOT NULL,
    PortalTotalBefore DECIMAL(18,2) NOT NULL,
    PortalShortAfter DECIMAL(18,2) NULL,
    PortalLongAfter DECIMAL(18,2) NULL,
    PortalTotalAfter DECIMAL(18,2) NULL,
    Diferencia DECIMAL(18,2) NOT NULL,
    SmsJustificados INT NOT NULL CONSTRAINT DF_SmsBalanceReconciliation_SmsJustificados DEFAULT 0,
    AjusteAdministrativo DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliation_AjusteAdministrativo DEFAULT 0,
    [Status] VARCHAR(40) NOT NULL,
    Notes NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SmsBalanceReconciliation_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_SmsBalanceReconciliation_Client
        FOREIGN KEY (ClientId) REFERENCES dbo.clients(id),

    CONSTRAINT FK_SmsBalanceReconciliation_ClientAccess
        FOREIGN KEY (AccessId) REFERENCES dbo.client_access(id)
);
GO

CREATE UNIQUE INDEX UX_SmsBalanceReconciliation_Client_Access_Date
ON dbo.SmsBalanceReconciliation(ClientId, AccessId, FechaRevision);
GO

CREATE TABLE dbo.SmsBalanceReconciliationDetail
(
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ReconciliationId INT NOT NULL,
    RoomId INT NOT NULL,
    ShortBefore DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_ShortBefore DEFAULT 0,
    LongBefore DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_LongBefore DEFAULT 0,
    ShortDelta DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_ShortDelta DEFAULT 0,
    LongDelta DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_LongDelta DEFAULT 0,
    ShortAfter DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_ShortAfter DEFAULT 0,
    LongAfter DECIMAL(18,2) NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_LongAfter DEFAULT 0,
    Reason VARCHAR(60) NOT NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_SmsBalanceReconciliationDetail_CreatedAt DEFAULT SYSDATETIME(),

    CONSTRAINT FK_SmsBalanceReconciliationDetail_Header
        FOREIGN KEY (ReconciliationId) REFERENCES dbo.SmsBalanceReconciliation(Id),

    CONSTRAINT FK_SmsBalanceReconciliationDetail_Room
        FOREIGN KEY (RoomId) REFERENCES dbo.rooms(id)
);
GO

CREATE INDEX IX_SmsBalanceReconciliationDetail_ReconciliationId
ON dbo.SmsBalanceReconciliationDetail(ReconciliationId);
GO


/* ============================================================
   07. Funciones y stored procedures
   ============================================================ */

CREATE FUNCTION dbo.SplitStringToTable
(
    @String NVARCHAR(MAX),
    @Delimiter CHAR(1)
)
RETURNS @Output TABLE (Val NVARCHAR(100))
AS
BEGIN
    DECLARE @Start INT = 1, @End INT;
 
    WHILE CHARINDEX(@Delimiter, @String, @Start) > 0
    BEGIN
        SET @End = CHARINDEX(@Delimiter, @String, @Start);
        INSERT INTO @Output (Val)
        VALUES (SUBSTRING(@String, @Start, @End - @Start));
        SET @Start = @End + 1;
    END
 
    IF @Start <= LEN(@String)
    BEGIN
        INSERT INTO @Output (Val)
        VALUES (SUBSTRING(@String, @Start, LEN(@String) - @Start + 1));
    END
 
    RETURN;
END
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
GO

CREATE PROCEDURE sp_getCampaignsToAutoStart
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
GO

CREATE PROCEDURE [dbo].[spResolveContactTimeZone]
    @ZipCode VARCHAR(10) = NULL,
    @Phone VARCHAR(30) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Result TABLE (
        ZipCode VARCHAR(10) NULL,
        State VARCHAR(10) NULL,
        Municipality VARCHAR(150) NULL,
        Location VARCHAR(150) NULL,
        Description VARCHAR(100) NULL,
        WinterTimeDifference DECIMAL(4,1) NULL,
        tz_id INT NULL,
        tz_name VARCHAR(20) NULL,
        TimeZoneSource VARCHAR(30) NOT NULL
    );

    DECLARE @CleanZipCode VARCHAR(10);
    DECLARE @Phone10 VARCHAR(10);

    SET @CleanZipCode = NULLIF(LTRIM(RTRIM(@ZipCode)), '');

    -- 1. Flujo principal: Código Postal
    IF @CleanZipCode IS NOT NULL
    BEGIN
        INSERT INTO @Result (
            ZipCode,
            State,
            Municipality,
            Location,
            Description,
            WinterTimeDifference,
            tz_id,
            tz_name,
            TimeZoneSource
        )
        SELECT TOP 1
            cp.ZipCode,
            cp.State,
            cp.Municipality,
            cp.Location,
            cp.Description,
            cp.WinterTimeDifference,
            cp.tz_id,
            tz.tz_name,
            'PostalCode'
        FROM dbo.ccTimeZoneAreaCP cp
        INNER JOIN dbo.ccTimeZones tz
            ON tz.tz_id = cp.tz_id
        WHERE cp.ZipCode = @CleanZipCode
        ORDER BY cp.ZipCode;

        IF EXISTS (SELECT 1 FROM @Result)
        BEGIN
            SELECT
                ZipCode,
                [State],
                Municipality,
                [Location],
                [Description],
                WinterTimeDifference,
                tz_id,
                tz_name,
                TimeZoneSource
            FROM @Result;
            RETURN;
        END
    END;

    -- 2. Fallback: Teléfono / COFETEL
    IF NULLIF(LTRIM(RTRIM(@Phone)), '') IS NOT NULL
    BEGIN
        SET @Phone10 = RIGHT(
            REPLACE(
            REPLACE(
            REPLACE(
            REPLACE(
            REPLACE(
            REPLACE(
            REPLACE(@Phone, '+52', ''),
                ' ', ''),
                '-', ''),
                '(', ''),
                ')', ''),
                '.', ''),
                '/', ''),
            10
        );

        ;WITH PhoneCandidates AS (
            -- Lada 2 dígitos: 33 + 1000 + 1234
            SELECT
                TRY_CONVERT(INT, LEFT(@Phone10, 2)) AS Cld,
                TRY_CONVERT(INT, SUBSTRING(@Phone10, 3, 4)) AS Serie,
                TRY_CONVERT(INT, RIGHT(@Phone10, 4)) AS Num4,
                1 AS Priority

            UNION ALL

            -- Lada 3 dígitos: 449 + 100 + 1234
            SELECT
                TRY_CONVERT(INT, LEFT(@Phone10, 3)) AS Cld,
                TRY_CONVERT(INT, SUBSTRING(@Phone10, 4, 3)) AS Serie,
                TRY_CONVERT(INT, RIGHT(@Phone10, 4)) AS Num4,
                2 AS Priority
        )
        INSERT INTO @Result (
            ZipCode,
            State,
            Municipality,
            Location,
            Description,
            WinterTimeDifference,
            tz_id,
            tz_name,
            TimeZoneSource
        )
        SELECT TOP 1
            NULL AS ZipCode,
            ISNULL(m.TargetState, ps.Estado) AS State,
            ps.Municipio AS Municipality,
            ps.Poblacion AS Location,
            cp.Description,
            cp.WinterTimeDifference,
            cp.tz_id,
            tz.tz_name,
            'PhoneSeries'
        FROM PhoneCandidates pc
        INNER JOIN dbo.ccPhoneSeriesMX ps
            ON ps.Cld = pc.Cld
           AND ps.Serie = pc.Serie
           AND pc.Num4 BETWEEN ps.NumeracionInicial AND ps.NumeracionFinal
        LEFT JOIN dbo.ccStateCodeMap m
            ON m.SourceSystem = 'COFETEL'
           AND m.SourceState = ps.Estado
        CROSS APPLY (
            SELECT TOP 1
                cp.ZipCode,
                cp.Description,
                cp.WinterTimeDifference,
                cp.tz_id
            FROM dbo.ccTimeZoneAreaCP cp
            WHERE cp.State = ISNULL(m.TargetState, ps.Estado)
            ORDER BY cp.ZipCode
        ) cp
        INNER JOIN dbo.ccTimeZones tz
            ON tz.tz_id = cp.tz_id
        WHERE LEN(@Phone10) = 10
        ORDER BY
            pc.Priority,
            cp.ZipCode;

        IF EXISTS (SELECT 1 FROM @Result)
        BEGIN
            SELECT
                ZipCode,
                [State],
                Municipality,
                [Location],
                [Description],
                WinterTimeDifference,
                tz_id,
                tz_name,
                TimeZoneSource
            FROM @Result;
            RETURN;
        END
    END;

    -- 3. No encontrado
    SELECT
        CAST(NULL AS VARCHAR(10)) AS ZipCode,
        CAST(NULL AS VARCHAR(10)) AS State,
        CAST(NULL AS VARCHAR(150)) AS Municipality,
        CAST(NULL AS VARCHAR(150)) AS Location,
        CAST(NULL AS VARCHAR(100)) AS Description,
        CAST(NULL AS DECIMAL(4,1)) AS WinterTimeDifference,
        CAST(NULL AS INT) AS tz_id,
        CAST(NULL AS VARCHAR(20)) AS tz_name,
        CAST('Unknown' AS VARCHAR(30)) AS TimeZoneSource;
END;
GO

CREATE PROCEDURE [dbo].[sp_getSmsDeliveryReport]
    @StartDate DATETIME,
    @EndDate DATETIME,
    @RoomId INT,
    @ReportType NVARCHAR(20), -- 'entrantes', 'enviados', 'noenviados', 'rechazados'
    @UserIds NVARCHAR(MAX) = NULL,
    @CampaignIds NVARCHAR(MAX) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @Export BIT = 0 -- 👈 nuevo parámetro
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
 
    -- Calcular OFFSET
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
 
    -- TotalCount
    SELECT COUNT(*) AS TotalCount
    FROM (
        SELECT 1 AS DummyColumn
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
                (@ReportType = 'entrantes' AND LTRIM(RTRIM(ccs.ResponseMessage)) <> '')
                OR (@ReportType = 'enviados' AND ccs.Status IN ('0', '1'))
                OR (@ReportType = 'noenviados' AND ccs.Status IN ('2', '3'))
                OR (@ReportType = 'rechazados' AND ccs.Status IN ('4', '5'))
            )
    ) AS CountResult;
 
    -- Datos
    WITH ResultSet AS (
        SELECT 
            ccs.Id AS MessageId,
            c.Message,
            c.Name AS CampaignName,
            c.Id AS CampaignId,
            u.id AS UserId,
            u.userName AS UserName,
            r.name AS RoomName,
            cc.PhoneNumber,
			cc.CP,
            ccs.Status,
            ccs.ResponseMessage,
            ccs.SentAt,
            ROW_NUMBER() OVER (ORDER BY ccs.SentAt DESC) AS RowNum
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
                (@ReportType = 'entrantes' AND LTRIM(RTRIM(ccs.ResponseMessage)) <> '')
                OR (@ReportType = 'enviados' AND ccs.Status IN ('0', '1'))
                OR (@ReportType = 'noenviados' AND ccs.Status IN ('2', '3'))
                OR (@ReportType = 'rechazados' AND ccs.Status IN ('4', '5'))
            )
    )
    SELECT *
    FROM ResultSet
    WHERE (@Export = 1 OR RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize) -- 👈 clave
    ORDER BY RowNum;
END
GO

CREATE PROCEDURE [dbo].[sp_getGlobalReport]
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @RoomId INT,
    @PageNumber INT = 1,
    @PageSize INT = 50,
    @Export BIT = 0,
    @CampaignIds NVARCHAR(MAX) = NULL,
    @UserIds NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;

    ;WITH CampaignFilter AS (
        SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT) AS CampaignId
        FROM STRING_SPLIT(ISNULL(@CampaignIds, ''), ',')
        WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
    ),
    UserFilter AS (
        SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT) AS UserId
        FROM STRING_SPLIT(ISNULL(@UserIds, ''), ',')
        WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL
    ),
    ResultSet AS (
        SELECT
            cc.SentAt AS [Date],
            cct.PhoneNumber AS Phone,
            cct.CP,
            r.name AS Room,
            cp.Name AS Campaign,
            cp.Id AS CampaignId,
            u.userName AS [User],
            u.id AS UserId,
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
            END AS Type,
            ROW_NUMBER() OVER (ORDER BY cc.SentAt DESC) AS RowNum,
            COUNT(*) OVER() AS TotalCount
        FROM Campaigns cp
        INNER JOIN CampaignContacts cct 
            ON cp.Id = cct.CampaignId
        INNER JOIN CampaignContactScheduleSend cc 
            ON cc.ContactId = cct.Id
        LEFT JOIN Template t 
            ON cp.TemplateId = t.Id
        LEFT JOIN rooms r 
            ON cp.RoomId = r.id
        LEFT JOIN roomsbyuser ru 
            ON ru.idRoom = r.id
        LEFT JOIN users u 
            ON ru.idUser = u.id
        LEFT JOIN clients cl 
            ON u.idCliente = cl.id
        LEFT JOIN MyNumbers mn 
            ON mn.Number = cct.PhoneNumber 
           AND mn.idClient = cl.id
        WHERE cp.RoomId = @RoomId
          AND (@StartDate IS NULL OR cc.SentAt >= @StartDate)
          AND (@EndDate IS NULL OR cc.SentAt <= @EndDate)
          AND (
                NOT EXISTS (SELECT 1 FROM CampaignFilter)
                OR cp.Id IN (SELECT CampaignId FROM CampaignFilter)
              )
          AND (
                NOT EXISTS (SELECT 1 FROM UserFilter)
                OR u.id IN (SELECT UserId FROM UserFilter)
              )
    )
    SELECT *
    FROM ResultSet
    WHERE (@Export = 1 OR RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize)
    ORDER BY RowNum;
END
GO
select * from users
IF COL_LENGTH(N'dbo.Roles', N'CreatedAt') IS NULL
    ALTER TABLE dbo.Roles ADD CreatedAt DATETIME2(0) NULL;
GO

/*
  Multi-role assignment migration for SQL Server.
  Keeps dbo.users.idRole temporarily for compatibility with existing code.
  dbo.UserRole becomes the source of truth for the complete assignment set.
*/
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.users', N'U') IS NULL
        THROW 51100, 'No existe dbo.users.', 1;
    IF OBJECT_ID(N'dbo.Roles', N'U') IS NULL
        THROW 51101, 'No existe dbo.Roles.', 1;
    IF COL_LENGTH(N'dbo.users', N'Id') IS NULL
       OR COL_LENGTH(N'dbo.users', N'idRole') IS NULL
       OR COL_LENGTH(N'dbo.users', N'IdCliente') IS NULL
        THROW 51102, 'dbo.users debe tener Id, IdCliente e idRole.', 1;
    IF COL_LENGTH(N'dbo.Roles', N'id') IS NULL
       OR COL_LENGTH(N'dbo.Roles', N'idCliente') IS NULL
        THROW 51103, 'dbo.Roles debe tener id e idCliente.', 1;

    IF OBJECT_ID(N'dbo.UserRole', N'U') IS NULL
    BEGIN
        CREATE TABLE dbo.UserRole
        (
            UserId    INT NOT NULL,
            RoleId    INT NOT NULL,
            CreatedAt DATETIME2(0) NOT NULL
                CONSTRAINT DF_UserRole_CreatedAt DEFAULT (SYSUTCDATETIME()),
            CONSTRAINT PK_UserRole PRIMARY KEY CLUSTERED (UserId, RoleId),
            CONSTRAINT FK_UserRole_users FOREIGN KEY (UserId)
                REFERENCES dbo.users(Id) ON DELETE CASCADE,
            CONSTRAINT FK_UserRole_Roles FOREIGN KEY (RoleId)
                REFERENCES dbo.Roles(id) ON DELETE NO ACTION
        );

        CREATE INDEX IX_UserRole_RoleId ON dbo.UserRole(RoleId, UserId);
    END;

    /* Migrate each user's existing single role into the new relation. */
    INSERT INTO dbo.UserRole (UserId, RoleId)
    SELECT u.Id, u.idRole
    FROM dbo.users AS u
    INNER JOIN dbo.Roles AS r ON r.id = u.idRole
    WHERE u.idRole > 0
      AND NOT EXISTS
      (
          SELECT 1
          FROM dbo.UserRole AS ur
          WHERE ur.UserId = u.Id AND ur.RoleId = u.idRole
      );

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO

/*
  After deploying this migration, update all create/update/assignment endpoints
  to write dbo.UserRole transactionally. Keep dbo.users.idRole synchronized to
  the selected default role or the first custom role only while legacy readers
  still require it. Authorization must read every UserRole and combine role
  permissions. Validate custom roles against users.IdCliente in the API; the
  tenant rule cannot be enforced by a basic FK.
*/


/* ============================================================
   99. Mantenimiento operativo
   ============================================================ */

CREATE OR ALTER PROCEDURE dbo.sp_CleanExpiredTpmCampaignContacts
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @FechaCorte DATETIME = CAST(GETDATE() AS DATE);
    DECLARE @Rows INT = 1;
    DECLARE @TotalDeleted INT = 0;

    WHILE (@Rows > 0)
    BEGIN
        DELETE TOP (5000)
        FROM dbo.tpm_CampaignContacts
        WHERE CreatedAt < @FechaCorte;

        SET @Rows = @@ROWCOUNT;
        SET @TotalDeleted += @Rows;
    END;

    PRINT CONCAT(
        'Limpieza tpm_CampaignContacts finalizada. Registros eliminados: ',
        @TotalDeleted,
        '. Fecha corte: ',
        CONVERT(VARCHAR(19), @FechaCorte, 120)
    );
END;
GO


-- ============================================================
-- Tugas 5 - Audit log: waktu UTC, index, dan proteksi append-only
-- Jalankan di SSMS/DBeaver memakai akun admin (sa), BUKAN login aplikasi.
-- Aman dijalankan berulang.
-- ============================================================
USE review_kantin;
GO

-- 1) created_at memakai UTC (SYSUTCDATETIME) agar konsisten di zona waktu mana pun.
DECLARE @df sysname = (
    SELECT dc.name
    FROM sys.default_constraints dc
    JOIN sys.columns c ON c.object_id = dc.parent_object_id AND c.column_id = dc.parent_column_id
    WHERE dc.parent_object_id = OBJECT_ID('dbo.AUDIT_LOGS') AND c.name = 'created_at'
);
IF @df IS NOT NULL EXEC('ALTER TABLE dbo.AUDIT_LOGS DROP CONSTRAINT ' + @df);
ALTER TABLE dbo.AUDIT_LOGS
    ADD CONSTRAINT DF_AUDIT_LOGS_created_at DEFAULT SYSUTCDATETIME() FOR created_at;
GO

-- 2) Index untuk riwayat terbaru, per pengguna, dan per target
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_created_at' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_created_at ON dbo.AUDIT_LOGS (created_at DESC, id DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_user' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_user ON dbo.AUDIT_LOGS (user_id, created_at DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AUDIT_LOGS_target' AND object_id = OBJECT_ID('dbo.AUDIT_LOGS'))
    CREATE INDEX IX_AUDIT_LOGS_target ON dbo.AUDIT_LOGS (target_table, target_id, created_at DESC);
GO

-- 3) Append-only: trigger menolak UPDATE dan DELETE untuk siapa pun (termasuk sa)
CREATE OR ALTER TRIGGER TR_AUDIT_LOGS_AppendOnly
ON dbo.AUDIT_LOGS
INSTEAD OF UPDATE, DELETE
AS
BEGIN
    THROW 50010, 'AUDIT_LOGS bersifat append-only.', 1;
END;
GO

-- 4) Lapisan kedua: login aplikasi hanya boleh SELECT dan INSERT
DENY UPDATE, DELETE ON dbo.AUDIT_LOGS TO aprilia;
GRANT SELECT, INSERT ON dbo.AUDIT_LOGS TO aprilia;
GO

-- Cek: trigger harus terdaftar
SELECT name, is_instead_of_trigger FROM sys.triggers WHERE parent_id = OBJECT_ID('dbo.AUDIT_LOGS');
GO

-- =============================================
-- TABLA: TIPO_CATEGORIAS
-- Ej: 'GASTO', 'INGRESO'
-- =============================================
CREATE TABLE "LUKAS"."TIPO_CATEGORIAS" (
  "ID"               SERIAL        PRIMARY KEY,
  "NOMBRE_TIPO"      TEXT          NOT NULL UNIQUE
);

-- =============================================
-- TABLA: CATEGORIAS
-- =============================================
CREATE TABLE "LUKAS"."CATEGORIAS" (
  "ID"               SERIAL        PRIMARY KEY,
  "NOMBRE_CATEGORIA" TEXT          NOT NULL,
  "TIPO_CATEGORIA"   INTEGER       NOT NULL REFERENCES "LUKAS"."TIPO_CATEGORIAS"("ID") ON DELETE RESTRICT
);

-- =============================================
-- TABLA: GASTOS
-- =============================================
CREATE TABLE "LUKAS"."GASTOS" (
  "UUID"             UUID          DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  "UUID_USUARIO"     UUID          NOT NULL REFERENCES "LUKAS"."USUARIOS"("UUID") ON DELETE CASCADE,
  "MONTO"            BIGINT        NOT NULL CHECK ("MONTO" > 0),
  "DESCRIPCION"      TEXT,
  "ID_CATEGORIA"     INTEGER       NOT NULL REFERENCES "LUKAS"."CATEGORIAS"("ID") ON DELETE RESTRICT,
  "CREATED_AT"       TIMESTAMPTZ   DEFAULT NOW(),
  "FINISHED_AT"      TIMESTAMPTZ
);

-- =============================================
-- TABLA: INGRESOS
-- =============================================
CREATE TABLE "LUKAS"."INGRESOS" (
  "UUID"             UUID          DEFAULT GEN_RANDOM_UUID() PRIMARY KEY,
  "UUID_USUARIO"     UUID          NOT NULL REFERENCES "LUKAS"."USUARIOS"("UUID") ON DELETE CASCADE,
  "MONTO"            BIGINT        NOT NULL CHECK ("MONTO" > 0),
  "DESCRIPCION"      TEXT,
  "ID_CATEGORIA"     INTEGER       NOT NULL REFERENCES "LUKAS"."CATEGORIAS"("ID") ON DELETE RESTRICT,
  "CREATED_AT"       TIMESTAMPTZ   DEFAULT NOW(),
  "FINISHED_AT"      TIMESTAMPTZ
);

-- =============================================
-- DATOS INICIALES: TIPO_CATEGORIAS
-- =============================================
INSERT INTO "LUKAS"."TIPO_CATEGORIAS" ("NOMBRE_TIPO") VALUES
  ('GASTO'),
  ('INGRESO');

-- =============================================
-- DATOS INICIALES: CATEGORIAS
-- =============================================
INSERT INTO "LUKAS"."CATEGORIAS" ("NOMBRE_CATEGORIA", "TIPO_CATEGORIA") VALUES
  -- Gastos (TIPO_CATEGORIA = 1)
  ('ALIMENTACION',      1),
  ('TRANSPORTE',        1),
  ('VIVIENDA',          1),
  ('SALUD',             1),
  ('ENTRETENIMIENTO',   1),
  ('EDUCACION',         1),
  ('ROPA',              1),
  ('OTROS GASTOS',      1),
  -- Ingresos (TIPO_CATEGORIA = 2)
  ('SUELDO',            2),
  ('FREELANCE',         2),
  ('ARRIENDO',          2),
  ('INVERSIONES',       2),
  ('OTROS INGRESOS',    2);
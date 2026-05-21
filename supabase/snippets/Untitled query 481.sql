-- Exponer el schema LUKAS a la API
GRANT USAGE ON SCHEMA "LUKAS" TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "LUKAS" TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "LUKAS" GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER TABLE "LUKAS"."USUARIOS" 
DROP COLUMN "CONTRASENA";
-- Exponer el schema LUKAS a la API
GRANT USAGE ON SCHEMA "LUKAS" TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA "LUKAS" TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA "LUKAS" GRANT ALL ON TABLES TO anon, authenticated, service_role;

ALTER TABLE "LUKAS"."USUARIOS" 
DROP COLUMN "CONTRASENA";

ALTER TABLE "LUKAS"."USUARIOS"
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role insert" ON "LUKAS"."USUARIOS"
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role select" ON "LUKAS"."USUARIOS"
  FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow auth select own user" ON "LUKAS"."USUARIOS"
  FOR SELECT
  USING (auth.uid() = UUID);
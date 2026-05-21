import { supabaseAdmin } from "@/src/lib/supabase-server"

export const LUKAS_SCHEMA = "LUKAS"

export function throwIfSupabaseError(error: { message: string } | null): void {
  if (error) {
    console.error("[supabase] Error:", error.message)
    throw new Error(error.message)
  }
}

/** Categoría por defecto: OTROS GASTOS (1) u OTROS INGRESOS (2) */
export async function getDefaultCategoryId(tipo: 1 | 2): Promise<number> {
  const nombre = tipo === 1 ? "OTROS GASTOS" : "OTROS INGRESOS"

  const { data, error } = await supabaseAdmin
    .schema(LUKAS_SCHEMA)
    .from("CATEGORIAS")
    .select("ID")
    .eq("TIPO_CATEGORIA", tipo)
    .ilike("NOMBRE_CATEGORIA", nombre)
    .maybeSingle()

  throwIfSupabaseError(error)

  if (!data?.ID) {
    throw new Error(`No se encontró la categoría por defecto para tipo ${tipo}`)
  }

  return data.ID as number
}

export async function checkSupabaseConnection(): Promise<{ ok: true }> {
  const { error } = await supabaseAdmin
    .schema(LUKAS_SCHEMA)
    .from("USUARIOS")
    .select("UUID")
    .limit(1)

  throwIfSupabaseError(error)
  return { ok: true }
}

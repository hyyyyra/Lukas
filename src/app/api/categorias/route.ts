import { NextResponse } from "next/server"
import { supabaseAdmin, getUserFromToken } from "@/src/lib/supabase-server"
import { LUKAS_SCHEMA, throwIfSupabaseError } from "@/src/lib/supabase-db"

export async function GET(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const tipoParam = searchParams.get("tipo")
    const tipo = tipoParam ? Number(tipoParam) : undefined

    let query = supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from("CATEGORIAS")
      .select(`
        ID,
        NOMBRE_CATEGORIA,
        TIPO_CATEGORIA,
        TIPO_CATEGORIAS ( ID, NOMBRE_TIPO )
      `)
      .order("NOMBRE_CATEGORIA", { ascending: true })

    if (tipo && !Number.isNaN(tipo)) {
      query = query.eq("TIPO_CATEGORIA", tipo)
    }

    const { data, error } = await query

    throwIfSupabaseError(error)

    const categorias = (data ?? []).map((row) => {
      const tipoRel = row.TIPO_CATEGORIAS
      const tipo = Array.isArray(tipoRel) ? tipoRel[0] : tipoRel
      return {
        id: row.ID,
        nombre: row.NOMBRE_CATEGORIA,
        tipo_categoria: row.TIPO_CATEGORIA,
        tipo: tipo?.NOMBRE_TIPO,
      }
    })

    return NextResponse.json(categorias)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[categorias GET] Error:", message)
    return NextResponse.json({ message: "Error al obtener categorías" }, { status: 500 })
  }
}

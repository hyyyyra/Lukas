import { NextResponse } from "next/server"
import { supabaseAdmin, getUserFromToken } from "@/src/lib/supabase-server"
import { LUKAS_SCHEMA, throwIfSupabaseError } from "@/src/lib/supabase-db"

export async function GET(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const { data, error } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from("USUARIOS")
      .select("UUID, NOMBRE, APELLIDOS, EMAIL, CREATED_AT")
      .eq("UUID", auth.userId)
      .single()

    throwIfSupabaseError(error)

    return NextResponse.json({
      id: data.UUID,
      nombre: data.NOMBRE,
      apellidos: data.APELLIDOS,
      name: `${data.NOMBRE} ${data.APELLIDOS}`.trim(),
      email: data.EMAIL,
      created_at: data.CREATED_AT,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[profile GET] Error:", message)
    return NextResponse.json({ message: "Error al obtener perfil" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/src/lib/supabase-server"
import { LUKAS_SCHEMA, throwIfSupabaseError } from "@/src/lib/supabase-db"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 },
      )
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.session) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }

    const { data: userData, error: dbError } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from("USUARIOS")
      .select("UUID, NOMBRE, APELLIDOS, EMAIL")
      .eq("UUID", authData.user.id)
      .single()

    throwIfSupabaseError(dbError)

    if (!userData) {
      return NextResponse.json(
        { message: "Usuario no encontrado en la base de datos" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      token: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      user: {
        id: userData.UUID,
        nombre: userData.NOMBRE,
        apellidos: userData.APELLIDOS,
        email: userData.EMAIL,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[login] Error:", message)
    return NextResponse.json({ message: "Error al iniciar sesión: " + message }, { status: 500 })
  }
}

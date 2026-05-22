import { NextResponse } from "next/server"
import { supabase } from "@/src/lib/supabase"
import { supabaseAdmin } from "@/src/lib/supabase-server"
import { LUKAS_SCHEMA, throwIfSupabaseError } from "@/src/lib/supabase-db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    const nameParts = name.trim().split(" ")
    const nombre = nameParts[0]
    const apellidos = nameParts.slice(1).join(" ") || ""

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      const yaExiste = authError.message.toLowerCase().includes("already")
      return NextResponse.json(
        { message: yaExiste ? "El email ya está registrado" : authError.message },
        { status: 400 },
      )
    }

    const userId = authData.user.id

    const { error: dbError } = await supabaseAdmin.schema(LUKAS_SCHEMA).from("USUARIOS").insert({
      UUID: userId,
      NOMBRE: nombre,
      APELLIDOS: apellidos,
      EMAIL: email,
    })

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      throw dbError
    }

    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !sessionData.session) {
      return NextResponse.json(
        { message: "Cuenta creada, pero no se pudo iniciar sesión. Intenta iniciar sesión manualmente." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      token: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
      user: {
        id: userId,
        nombre,
        apellidos,
        email,
      },
    })
  } catch (error: any) {
    console.error("[register] FULL ERROR:", error)
  
    return NextResponse.json(
      {
        message:
          error?.message ||
          error?.details ||
          JSON.stringify(error),
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const users = await query("SELECT * FROM usuarios WHERE EMAIL = ?", [email])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }

    const user = users[0]

    // Nota: CONTRASENA almacena la contraseña. En producción debería usarse hash.
    if (user.CONTRASENA !== password) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
    }

    const token = Buffer.from(`${user.ID_USUARIO}:${user.EMAIL}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: {
        id: user.ID_USUARIO,
        nombre: user.NOMBRE,
        apellidos: user.APELLIDO,
        email: user.EMAIL,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json({ message: "Error al iniciar sesión: " + error.message }, { status: 500 })
  }
}

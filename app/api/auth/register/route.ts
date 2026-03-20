import { NextResponse } from "next/server"
import { query } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Todos los campos son requeridos" }, { status: 400 })
    }

    const nameParts = name.trim().split(" ")
    const nombre = nameParts[0]
    const apellidos = nameParts.slice(1).join(" ") || ""

    const existingUsers = await query("SELECT ID_USUARIO FROM usuarios WHERE EMAIL = ?", [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ message: "El email ya está registrado" }, { status: 400 })
    }

    // Nota: Se están usando los nombres de columnas de la base de datos existente (mayúsculas)
    const result = await query("INSERT INTO USUARIOS (NOMBRE, APELLIDO, EMAIL, CONTRASENA) VALUES (?, ?, ?, ?)", [
      nombre,
      apellidos,
      email,
      password,
    ])

    const insertId = (result as any).insertId

    const token = Buffer.from(`${insertId}:${email}:${Date.now()}`).toString("base64")

    return NextResponse.json({
      token,
      user: {
        id: insertId,
        nombre,
        apellidos,
        email,
      },
    })
  } catch (error: any) {
    console.error("[v0] Error en registro:", error)
    return NextResponse.json({ message: "Error al crear cuenta: " + error.message }, { status: 500 })
  }
}

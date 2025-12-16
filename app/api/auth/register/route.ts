import { NextResponse } from "next/server"

// Objetivo: proxy hacia Laravel para registrar usuarios evitando acceso directo a SQL
export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const baseUrl = process.env.LARAVEL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

    const resp = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await resp.json().catch(() => ({ message: "Error desconocido" }))
    return NextResponse.json(data, { status: resp.status })
  } catch (error: any) {
    console.error("[v0] Error en registro:", error)
    return NextResponse.json({ message: "Error al crear cuenta: " + error.message }, { status: 500 })
  }
}

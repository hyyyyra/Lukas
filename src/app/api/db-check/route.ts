import { NextResponse } from "next/server"
import { checkSupabaseConnection } from "@/src/lib/supabase-db"

export async function GET() {
  try {
    await checkSupabaseConnection()

    return NextResponse.json({
      status: "connected",
      database: "Supabase (PostgreSQL)",
      schema: "LUKAS",
      message: "Conexión exitosa con Supabase",
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[db-check] Error:", message)
    return NextResponse.json(
      {
        status: "error",
        message: message || "No se pudo conectar a Supabase",
      },
      { status: 500 },
    )
  }
}

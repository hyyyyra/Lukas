import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Valida el JWT de Supabase y retorna el userId o un NextResponse de error
export async function getUserFromToken(
  request: Request
): Promise<{ userId: string } | NextResponse> {
  const authHeader = request.headers.get("Authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 })
  }

  const token = authHeader.split(" ")[1]

  const { data, error } = await supabaseAdmin.auth.getUser(token)

  if (error || !data.user) {
    return NextResponse.json({ message: "Token inválido" }, { status: 401 })
  }

  return { userId: data.user.id }
}
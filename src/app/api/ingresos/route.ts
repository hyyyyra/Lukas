import { NextResponse } from "next/server"
import { supabaseAdmin, getUserFromToken } from "@/src/lib/supabase-server"
import { LUKAS_SCHEMA, throwIfSupabaseError } from "@/src/lib/supabase-db"
import { mapMovimiento, mapMovimientos } from "@/src/lib/supabase-mappers"
import { parseMovimientoBody, parseMovimientoPatch } from "@/src/lib/movimiento-body"

const TABLE = "INGRESOS"

export async function GET(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const { data, error } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from(TABLE)
      .select(`
        UUID,
        MONTO,
        DESCRIPCION,
        CREATED_AT,
        FINISHED_AT,
        ID_CATEGORIA,
        CATEGORIAS (
          ID,
          NOMBRE_CATEGORIA,
          TIPO_CATEGORIAS ( NOMBRE_TIPO )
        )
      `)
      .eq("UUID_USUARIO", auth.userId)
      .order("CREATED_AT", { ascending: false })

    throwIfSupabaseError(error)

    return NextResponse.json(mapMovimientos(data))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[ingresos GET] Error:", message)
    return NextResponse.json({ message: "Error al obtener ingresos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { monto, descripcion, id_categoria, finished_at } = await parseMovimientoBody(body, "ingreso")

    if (!monto || monto <= 0) {
      return NextResponse.json({ message: "Monto válido es requerido" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from(TABLE)
      .insert({
        UUID_USUARIO: auth.userId,
        MONTO: monto,
        DESCRIPCION: descripcion,
        ID_CATEGORIA: id_categoria,
        FINISHED_AT: finished_at ?? null,
      })
      .select(`
        UUID,
        MONTO,
        DESCRIPCION,
        CREATED_AT,
        FINISHED_AT,
        ID_CATEGORIA,
        CATEGORIAS (
          ID,
          NOMBRE_CATEGORIA,
          TIPO_CATEGORIAS ( NOMBRE_TIPO )
        )
      `)
      .single()

    throwIfSupabaseError(error)

    return NextResponse.json(mapMovimiento(data))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[ingresos POST] Error:", message)
    return NextResponse.json({ message: "Error al crear ingreso" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const body = await request.json()
    const { uuid, monto, descripcion, id_categoria, finished_at } = {
      uuid: body.uuid as string | undefined,
      ...parseMovimientoPatch(body),
    }

    if (!uuid) {
      return NextResponse.json({ message: "UUID del ingreso es requerido" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from(TABLE)
      .update({
        ...(monto !== undefined && !Number.isNaN(monto) && { MONTO: monto }),
        ...(descripcion !== undefined && { DESCRIPCION: descripcion }),
        ...(id_categoria !== undefined && !Number.isNaN(id_categoria) && { ID_CATEGORIA: id_categoria }),
        ...(finished_at !== undefined && { FINISHED_AT: finished_at }),
      })
      .eq("UUID", uuid)
      .eq("UUID_USUARIO", auth.userId)
      .select(`
        UUID,
        MONTO,
        DESCRIPCION,
        CREATED_AT,
        FINISHED_AT,
        ID_CATEGORIA,
        CATEGORIAS (
          ID,
          NOMBRE_CATEGORIA,
          TIPO_CATEGORIAS ( NOMBRE_TIPO )
        )
      `)
      .single()

    throwIfSupabaseError(error)

    return NextResponse.json(mapMovimiento(data))
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[ingresos PATCH] Error:", message)
    return NextResponse.json({ message: "Error al actualizar ingreso" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await getUserFromToken(request)
    if (auth instanceof NextResponse) return auth

    const { searchParams } = new URL(request.url)
    const uuid = searchParams.get("uuid")

    if (!uuid) {
      return NextResponse.json({ message: "UUID requerido" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .schema(LUKAS_SCHEMA)
      .from(TABLE)
      .delete()
      .eq("UUID", uuid)
      .eq("UUID_USUARIO", auth.userId)

    throwIfSupabaseError(error)

    return NextResponse.json({ message: "Ingreso eliminado" })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    console.error("[ingresos DELETE] Error:", message)
    return NextResponse.json({ message: "Error al eliminar ingreso" }, { status: 500 })
  }
}

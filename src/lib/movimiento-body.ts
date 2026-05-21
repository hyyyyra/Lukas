import { getDefaultCategoryId } from "@/src/lib/supabase-db"

type MovimientoTipo = "gasto" | "ingreso"

export async function parseMovimientoBody(
  body: Record<string, unknown>,
  tipo: MovimientoTipo,
): Promise<{
  monto: number
  descripcion: string | null
  id_categoria: number
  finished_at: string | null | undefined
}> {
  const monto = Number(body.monto)
  const descripcion =
    (typeof body.descripcion === "string" ? body.descripcion : null) ??
    (typeof body.nombre === "string" ? body.nombre : null)

  let id_categoria = body.id_categoria != null ? Number(body.id_categoria) : undefined
  if (!id_categoria || Number.isNaN(id_categoria)) {
    id_categoria = await getDefaultCategoryId(tipo === "gasto" ? 1 : 2)
  }

  const finished_at =
    body.finished_at !== undefined
      ? (body.finished_at as string | null)
      : body.pagado !== undefined
        ? body.pagado
          ? new Date().toISOString()
          : null
        : undefined

  return { monto, descripcion, id_categoria, finished_at }
}

export function parseMovimientoPatch(body: Record<string, unknown>) {
  const descripcion =
    body.descripcion !== undefined
      ? (body.descripcion as string | null)
      : body.nombre !== undefined
        ? (body.nombre as string | null)
        : undefined

  const finished_at =
    body.finished_at !== undefined
      ? (body.finished_at as string | null)
      : body.pagado !== undefined
        ? body.pagado
          ? new Date().toISOString()
          : null
        : undefined

  return {
    monto: body.monto !== undefined ? Number(body.monto) : undefined,
    descripcion,
    id_categoria: body.id_categoria !== undefined ? Number(body.id_categoria) : undefined,
    finished_at,
  }
}

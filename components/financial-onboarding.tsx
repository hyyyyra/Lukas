"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Plus, Trash2, Loader2, ArrowRight, ArrowLeft } from "lucide-react"

import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FrequencySchema = z.enum(["semanal", "quincenal", "mensual", "variable"])

const ExpenseSchema = z.object({
  nombre: z.string().trim(),
  montoMensual: z.coerce.number().finite().nonnegative(),
}).superRefine((val, ctx) => {
  const hasName = val.nombre.trim().length > 0
  const hasAmount = Number(val.montoMensual || 0) > 0

  // Permite filas vacías (para UX) siempre que no tengan monto.
  if (!hasName && !hasAmount) return

  if (!hasName) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["nombre"], message: "Ingresa un nombre" })
  }
  if (!hasAmount) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["montoMensual"], message: "Ingresa un monto" })
  }
})

const FinancialOnboardingSchema = z
  .object({
    tieneSueldo: z.boolean(),
    frecuenciaSueldo: FrequencySchema.optional(),
    montoSueldo: z.coerce.number().finite().nonnegative().optional(),
    gastos: z.array(ExpenseSchema),
  })
  .superRefine((val, ctx) => {
    if (val.tieneSueldo) {
      if (!val.frecuenciaSueldo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["frecuenciaSueldo"],
          message: "Selecciona la frecuencia",
        })
      }
      if (val.montoSueldo == null || Number.isNaN(val.montoSueldo)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["montoSueldo"],
          message: "Ingresa el monto",
        })
      }
    }
  })

type FinancialOnboardingValues = z.infer<typeof FinancialOnboardingSchema>

const SUGGESTED_EXPENSES = [
  "Arriendo / Hipoteca",
  "Comida",
  "Gastos comunes",
  "Luz",
  "Agua",
  "Internet",
  "Transporte",
  "Suscripciones",
]

function toMonthlyAmount(amount: number, frequency: z.infer<typeof FrequencySchema>) {
  if (!Number.isFinite(amount) || amount <= 0) return 0
  switch (frequency) {
    case "semanal":
      return Math.round(amount * 4.3333)
    case "quincenal":
      return Math.round(amount * 2)
    case "mensual":
    case "variable":
      return Math.round(amount)
  }
}

function makeLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function FinancialOnboarding() {
  const router = useRouter()
  const [step, setStep] = useState<"ingresos" | "gastos" | "resumen">("ingresos")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      router.replace("/login")
      return
    }
    const onboardingCompleted = localStorage.getItem("onboarding_completed")
    if (onboardingCompleted) {
      router.replace("/")
    }
  }, [router])

  const form = useForm<FinancialOnboardingValues>({
    resolver: zodResolver(FinancialOnboardingSchema),
    defaultValues: {
      tieneSueldo: true,
      frecuenciaSueldo: "mensual",
      montoSueldo: 0,
      gastos: [],
    },
    mode: "onSubmit",
  })

  const { control, register, watch, setValue, handleSubmit, formState } = form
  const tieneSueldo = watch("tieneSueldo")
  const frecuenciaSueldo = watch("frecuenciaSueldo") ?? "mensual"
  const montoSueldo = watch("montoSueldo") ?? 0
  const gastos = watch("gastos")

  const { fields, append, remove } = useFieldArray({ control, name: "gastos" })

  const resumen = useMemo(() => {
    const sueldoMensual = tieneSueldo ? toMonthlyAmount(Number(montoSueldo || 0), frecuenciaSueldo) : 0
    const totalGastos = (gastos || []).reduce((acc, g) => acc + (Number(g?.montoMensual || 0) || 0), 0)
    return {
      sueldoMensual,
      totalGastos,
      saldoMensual: sueldoMensual - totalGastos,
    }
  }, [tieneSueldo, frecuenciaSueldo, montoSueldo, gastos])

  const addSuggested = (name: string) => {
    const alreadyExists = (watch("gastos") || []).some((g) => g.nombre.trim().toLowerCase() === name.toLowerCase())
    if (alreadyExists) return
    append({ nombre: name, montoMensual: 0 })
  }

  const goNext = async () => {
    if (step === "ingresos") {
      const ok = await form.trigger(["tieneSueldo", "frecuenciaSueldo", "montoSueldo"])
      if (!ok) return
      setStep("gastos")
      return
    }
    if (step === "gastos") {
      const ok = await form.trigger(["gastos"])
      if (!ok) return
      setStep("resumen")
    }
  }

  const goBack = () => {
    setStep((s) => (s === "resumen" ? "gastos" : "ingresos"))
  }

  const onSubmit = async (values: FinancialOnboardingValues) => {
    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast.error("Tu sesión expiró. Inicia sesión nuevamente.")
      router.push("/login")
      return
    }

    setSaving(true)
    try {
      apiClient.setToken(token)

      const ingresosLocal: Array<{ id: string; nombre: string; monto: number }> = []
      const gastosLocal: Array<{ id: string; nombre: string; monto: number; pagado?: boolean }> = []

      if (values.tieneSueldo && values.frecuenciaSueldo) {
        const sueldoMensual = toMonthlyAmount(Number(values.montoSueldo || 0), values.frecuenciaSueldo)
        if (sueldoMensual > 0) {
          try {
            await apiClient.createIngreso("Sueldo", sueldoMensual)
          } catch (e) {
            // Fallback local si la API falla
          }
          ingresosLocal.push({ id: makeLocalId(), nombre: "Sueldo", monto: sueldoMensual })
        }
      }

      const filteredExpenses = (values.gastos || []).filter(
        (g) => g.nombre.trim().length > 0 && Number(g.montoMensual || 0) > 0
      )

      for (const expense of filteredExpenses) {
        try {
          await apiClient.createGasto(expense.nombre, Number(expense.montoMensual))
        } catch (e) {
          // Fallback local si la API falla
        }
        gastosLocal.push({
          id: makeLocalId(),
          nombre: expense.nombre,
          monto: Number(expense.montoMensual),
          pagado: false,
        })
      }

      localStorage.setItem("financialData", JSON.stringify({ ingresos: ingresosLocal, gastos: gastosLocal, moneda: "CLP" }))
      localStorage.setItem("onboarding_completed", "1")
      toast.success("Perfil financiero guardado.")
      router.push("/")
    } catch (error: any) {
      toast.error(error?.message || "No se pudo guardar tu perfil.")
    } finally {
      setSaving(false)
    }
  }

  const skip = () => {
    localStorage.setItem("onboarding_completed", "1")
    router.push("/")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Tu perfil financiero</CardTitle>
        <CardDescription>
          Completa lo esencial para empezar con una vista clara de tus ingresos y gastos fijos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("rounded-full border px-3 py-1", step === "ingresos" && "bg-accent text-foreground")}>
                1. Ingresos
              </span>
              <span className={cn("rounded-full border px-3 py-1", step === "gastos" && "bg-accent text-foreground")}>
                2. Gastos fijos
              </span>
              <span className={cn("rounded-full border px-3 py-1", step === "resumen" && "bg-accent text-foreground")}>
                3. Resumen
              </span>
            </div>
            <Button type="button" variant="ghost" onClick={skip} className="text-muted-foreground">
              Saltar por ahora
            </Button>
          </div>

          {step === "ingresos" && (
            <section className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-base font-medium">Sueldo</h2>
                  <p className="text-sm text-muted-foreground">Define si tienes sueldo y su periodicidad.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={tieneSueldo ? "default" : "outline"}
                    onClick={() => setValue("tieneSueldo", true, { shouldDirty: true, shouldValidate: true })}
                  >
                    Sí
                  </Button>
                  <Button
                    type="button"
                    variant={!tieneSueldo ? "default" : "outline"}
                    onClick={() => setValue("tieneSueldo", false, { shouldDirty: true, shouldValidate: true })}
                  >
                    No
                  </Button>
                </div>
              </div>

              {tieneSueldo && (
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>¿Cada cuánto lo recibes?</Label>
                    <Select
                      value={frecuenciaSueldo}
                      onValueChange={(v) =>
                        setValue("frecuenciaSueldo", v as any, { shouldDirty: true, shouldValidate: true })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una opción" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quincenal">Quincenal</SelectItem>
                        <SelectItem value="mensual">Mensual</SelectItem>
                        <SelectItem value="variable">Variable (promedio mensual)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formState.errors.frecuenciaSueldo && (
                      <p className="text-sm text-destructive">{formState.errors.frecuenciaSueldo.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {frecuenciaSueldo === "variable" ? "Monto promedio mensual (CLP)" : "Monto recibido (CLP)"}
                    </Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step="1"
                      placeholder={frecuenciaSueldo === "mensual" ? "Ej: 1000000" : "Ej: 250000"}
                      {...register("montoSueldo")}
                    />
                    {formState.errors.montoSueldo && (
                      <p className="text-sm text-destructive">{formState.errors.montoSueldo.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Estimación mensual: <span className="font-medium text-foreground">{resumen.sueldoMensual.toLocaleString("es-CL")}</span>{" "}
                      CLP
                    </p>
                  </div>
                </div>
              )}
            </section>
          )}

          {step === "gastos" && (
            <section className="rounded-xl border bg-card p-5">
              <div className="space-y-1">
                <h2 className="text-base font-medium">Gastos fijos mensuales</h2>
                <p className="text-sm text-muted-foreground">
                  Agrega tus gastos recurrentes (arriendo, comida, cuentas, etc.).
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTED_EXPENSES.map((name) => (
                  <Button key={name} type="button" variant="outline" size="sm" onClick={() => addSuggested(name)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {name}
                  </Button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {fields.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    Aún no agregas gastos. Usa los sugeridos o añade uno manualmente.
                  </div>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="grid gap-3 rounded-xl border bg-background p-4 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <Label className="sr-only" htmlFor={`gasto-nombre-${index}`}>
                        Nombre
                      </Label>
                      <Input id={`gasto-nombre-${index}`} placeholder="Ej: Arriendo" {...register(`gastos.${index}.nombre`)} />
                      {formState.errors.gastos?.[index]?.nombre && (
                        <p className="mt-1 text-sm text-destructive">
                          {formState.errors.gastos?.[index]?.nombre?.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-4">
                      <Label className="sr-only" htmlFor={`gasto-monto-${index}`}>
                        Monto mensual
                      </Label>
                      <Input
                        id={`gasto-monto-${index}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step="1"
                        placeholder="CLP"
                        {...register(`gastos.${index}.montoMensual`)}
                      />
                      {formState.errors.gastos?.[index]?.montoMensual && (
                        <p className="mt-1 text-sm text-destructive">
                          {formState.errors.gastos?.[index]?.montoMensual?.message}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-1 md:flex md:justify-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button type="button" variant="outline" onClick={() => append({ nombre: "", montoMensual: 0 })}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar gasto
                </Button>
              </div>
            </section>
          )}

          {step === "resumen" && (
            <section className="rounded-xl border bg-card p-5">
              <div className="space-y-1">
                <h2 className="text-base font-medium">Resumen mensual</h2>
                <p className="text-sm text-muted-foreground">Revisa antes de guardar.</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="mt-1 text-2xl font-light">{resumen.sueldoMensual.toLocaleString("es-CL")} CLP</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Gastos fijos</p>
                  <p className="mt-1 text-2xl font-light">{resumen.totalGastos.toLocaleString("es-CL")} CLP</p>
                </div>
                <div className="rounded-xl border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-light",
                      resumen.saldoMensual < 0 ? "text-destructive" : "text-foreground"
                    )}
                  >
                    {resumen.saldoMensual.toLocaleString("es-CL")} CLP
                  </p>
                </div>
              </div>

              {(gastos || []).length > 0 && (
                <div className="mt-5 rounded-xl border bg-background p-4">
                  <p className="text-sm font-medium">Detalle de gastos</p>
                  <div className="mt-3 space-y-2">
                    {gastos
                      .filter((g) => g.nombre.trim().length > 0)
                      .map((g, i) => (
                        <div key={`${g.nombre}-${i}`} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{g.nombre}</span>
                          <span className="font-medium">{Number(g.montoMensual || 0).toLocaleString("es-CL")} CLP</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === "ingresos" || saving}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>

            {step !== "resumen" ? (
              <Button type="button" onClick={goNext} disabled={saving}>
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Finalizar"
                )}
              </Button>
            )}
          </div>

          {formState.errors.gastos?.root?.message && (
            <p className="text-sm text-destructive">{formState.errors.gastos.root.message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

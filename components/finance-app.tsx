"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WelcomeHeader } from "@/components/welcome-header"
import { FinancialSummary } from "@/components/financial-summary"
import { TrendingUp, TrendingDown, CheckCircle, Circle } from "lucide-react"

import { convertCurrency, type Currency } from "@/lib/currency-converter"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"

interface FinancialData {
  ingresos: Array<{ id: string; nombre: string; monto: number }>
  gastos: Array<{ id: string; nombre: string; monto: number; pagado?: boolean }>
  moneda: Currency
}

export function FinanceApp() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [userName, setUserName] = useState<string>("")
  const [data, setData] = useState<FinancialData>({
    ingresos: [],
    gastos: [],
    moneda: "CLP",
  })

  useEffect(() => {
    setMounted(true)

    const checkAuth = async () => {
      const savedName = localStorage.getItem("userName")
      const savedData = localStorage.getItem("financialData")
      const token = localStorage.getItem("auth_token")

      if (savedName) {
        setUserName(savedName)
      } else if (token) {
        try {
          apiClient.setToken(token)
          const profile = await apiClient.getUserProfile()
          if (profile) {
            const name = (profile as any).name || (profile as any).nombre || (profile as any).NOMBRE || ""
            if (name) {
              setUserName(name)
              localStorage.setItem("userName", name)
            } else {
              router.push("/login")
            }
          }
        } catch (error) {
          console.error("Error fetching profile", error)
          router.push("/login")
        }
      } else {
        router.push("/login")
      }

      if (savedData) {
        try {
          setData(JSON.parse(savedData))
        } catch (e) {
          console.error("Error parsing financial data", e)
        }
      }

      if (token) {
        try {
          const [ingresos, gastos] = await Promise.all([
            apiClient.getIngresos(),
            apiClient.getGastos(),
          ])

          setData((prev) => ({
            ...prev,
            ingresos: Array.isArray(ingresos)
              ? ingresos.map((i: any) => ({
                id: i.id.toString(),
                nombre: i.nombre,
                monto: Number(i.monto),
              }))
              : [],
            gastos: Array.isArray(gastos)
              ? gastos.map((i: any) => ({
                id: i.id.toString(),
                nombre: i.nombre,
                monto: Number(i.monto),
                pagado: !!i.pagado,
              }))
              : [],
          }))
        } catch (error) {
          console.error("Error fetching financial data", error)
        }
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName)
    }
  }, [userName])

  useEffect(() => {
    localStorage.setItem("financialData", JSON.stringify(data))
  }, [data])

  const addIngreso = async (nombre: string, monto: number) => {
    if (nombre && monto > 0) {
      try {
        const newIngreso = await apiClient.createIngreso(nombre, monto)
        setData((prev) => ({
          ...prev,
          ingresos: [...prev.ingresos, { ...(newIngreso as any), id: (newIngreso as any).id.toString() }],
        }))
      } catch (error) {
        console.error("Error saving ingreso:", error)
        // Fallback or alert
        alert("Error al guardar el ingreso. Por favor intente nuevamente.")
      }
    }
  }

  const addGasto = async (nombre: string, monto: number) => {
    if (nombre && monto > 0) {
      try {
        const newGasto = await apiClient.createGasto(nombre, monto)
        setData((prev) => ({
          ...prev,
          gastos: [...prev.gastos, { ...(newGasto as any), id: (newGasto as any).id.toString(), pagado: false }],
        }))
      } catch (error) {
        console.error("Error saving gasto:", error)
        alert("Error al guardar el gasto. Por favor intente nuevamente.")
      }
    }
  }

  const toggleGastoStatus = async (id: string) => {
    const gasto = data.gastos.find((g) => g.id === id)
    if (!gasto) return

    const newStatus = !gasto.pagado
    try {
      await apiClient.updateGastoStatus(id, newStatus)
      setData((prev) => ({
        ...prev,
        gastos: prev.gastos.map((g) => (g.id === id ? { ...g, pagado: newStatus } : g)),
      }))
    } catch (error) {
      console.error("Error updating gasto status:", error)
      alert("Error al actualizar el estado del gasto.")
    }
  }

  const removeItem = async (type: keyof FinancialData, id: string) => {
    try {
      if (type === "ingresos") {
        await apiClient.deleteIngreso(id)
      } else if (type === "gastos") {
        await apiClient.deleteGasto(id)
      }

      if (Array.isArray(data[type])) {
        setData((prev) => ({
          ...prev,
          [type]: (prev[type] as any[]).filter((item) => item.id !== id),
        }))
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error)
      alert(`Error al eliminar ${type === "ingresos" ? "el ingreso" : "el gasto"}. Por favor intente nuevamente.`)
    }
  }

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("userName")
      localStorage.removeItem("financialData")
      localStorage.removeItem("auth_token")
      setUserName("")
      setData({
        ingresos: [],
        gastos: [],
        moneda: "CLP",
      })
      router.push("/login")
    }
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    const oldCurrency = data.moneda

    if (oldCurrency === newCurrency) return

    const convertedData = {
      ...data,
      moneda: newCurrency,
      ingresos: data.ingresos.map((item) => ({
        ...item,
        monto: convertCurrency(item.monto, oldCurrency, newCurrency),
      })),
      gastos: data.gastos.map((item) => ({
        ...item,
        monto: convertCurrency(item.monto, oldCurrency, newCurrency),
      })),
    }

    setData(convertedData)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <WelcomeHeader
          userName={userName}
          setUserName={setUserName}
          currency={data.moneda}
          onCurrencyChange={handleCurrencyChange}
          onLogout={handleLogout}
        />

        <FinancialSummary data={data} currency={data.moneda} />

        <Tabs defaultValue="ingresos" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 gap-2 h-auto p-1">
            <TabsTrigger value="ingresos" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Ingresos</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Gastos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingresos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Ingresos Fijos</CardTitle>
                <CardDescription>Registra tus fuentes de ingresos mensuales</CardDescription>
              </CardHeader>
              <CardContent>
                <IngresoForm onAdd={addIngreso} currency={data.moneda} />
                <ItemList
                  items={data.ingresos}
                  onRemove={(id) => removeItem("ingresos", id)}
                  type="ingreso"
                  currency={data.moneda}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gastos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Gastos Fijos</CardTitle>
                <CardDescription>Mantén un registro de tus gastos regulares</CardDescription>
              </CardHeader>
              <CardContent>
                <GastoForm onAdd={addGasto} currency={data.moneda} />
                <ItemList
                  items={data.gastos}
                  onRemove={(id) => removeItem("gastos", id)}
                  onToggleStatus={toggleGastoStatus}
                  type="gasto"
                  currency={data.moneda}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function IngresoForm({ onAdd, currency }: { onAdd: (nombre: string, monto: number) => void; currency: string }) {
  const [nombre, setNombre] = useState("")
  const [montoDisplay, setMontoDisplay] = useState("")

  const formatInputValue = (val: string) => {
    // Remove all non-digits
    const rawValue = val.replace(/\D/g, "")
    if (!rawValue) return ""

    if (currency === "CLP") {
      // Add dots every 3 digits
      return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    return rawValue
  }

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value)
    setMontoDisplay(formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rawValue = montoDisplay.replace(/\./g, "")
    onAdd(nombre, Number.parseFloat(rawValue))
    setNombre("")
    setMontoDisplay("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ingreso-nombre">Fuente de ingreso</Label>
          <Input
            id="ingreso-nombre"
            placeholder="Ej: Salario, Freelance..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ingreso-monto">Monto mensual ({currency})</Label>
          <Input
            id="ingreso-monto"
            type="text"
            inputMode="numeric"
            placeholder={currency === "CLP" ? "Ej: 1.000.000" : "0.00"}
            value={montoDisplay}
            onChange={handleMontoChange}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Agregar Ingreso
      </Button>
    </form>
  )
}

function GastoForm({ onAdd, currency }: { onAdd: (nombre: string, monto: number) => void; currency: string }) {
  const [nombre, setNombre] = useState("")
  const [montoDisplay, setMontoDisplay] = useState("")

  const formatInputValue = (val: string) => {
    const rawValue = val.replace(/\D/g, "")
    if (!rawValue) return ""

    if (currency === "CLP") {
      return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    }
    return rawValue
  }

  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputValue(e.target.value)
    setMontoDisplay(formatted)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const rawValue = montoDisplay.replace(/\./g, "")
    onAdd(nombre, Number.parseFloat(rawValue))
    setNombre("")
    setMontoDisplay("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gasto-nombre">Nombre de gasto</Label>
          <Input
            id="gasto-nombre"
            placeholder="Ej: Alquiler, Comida..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gasto-monto">Monto mensual ({currency})</Label>
          <Input
            id="gasto-monto"
            type="text"
            inputMode="numeric"
            placeholder={currency === "CLP" ? "Ej: 50.000" : "0.00"}
            value={montoDisplay}
            onChange={handleMontoChange}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Agregar Gasto
      </Button>
    </form>
  )
}



function ItemList({
  items,
  onRemove,
  onToggleStatus,
  type,
  currency,
}: {
  items: any[]
  onRemove: (id: string) => void
  onToggleStatus?: (id: string) => void
  type: string
  currency: string
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tienes {type}s registrados aún</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${Math.floor(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 border ${item.pagado ? "bg-primary/5 border-primary/20 opacity-80" : "bg-accent/50 border-transparent"
            }`}
        >
          <div className="flex items-center gap-4">
            {type === "gasto" && onToggleStatus && (
              <button
                onClick={() => onToggleStatus(item.id)}
                className={`transition-colors duration-200 ${item.pagado ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                title={item.pagado ? "Marcar como no pagado" : "Marcar como pagado"}
              >
                {item.pagado ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
              </button>
            )}
            <div>
              <p className={`font-medium ${item.pagado ? "line-through text-muted-foreground" : ""}`}>{item.nombre}</p>
              <p className={`text-2xl font-light mt-1 ${item.pagado ? "text-muted-foreground" : ""}`}>
                {formatCurrency(item.monto)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}



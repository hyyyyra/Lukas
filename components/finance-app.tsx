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
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target } from "lucide-react"
import { SavingsGoals } from "@/components/savings-goals"
import { convertCurrency, type Currency } from "@/lib/currency-converter"
import { AuthForms } from "@/components/auth-forms"

interface SavingsGoal {
  id: string
  titulo: string
  metaMonto: number
  montoActual: number
}

interface FinancialData {
  ingresos: Array<{ id: string; nombre: string; monto: number }>
  gastos: Array<{ id: string; nombre: string; monto: number }>
  deudas: Array<{ id: string; nombre: string; monto: number; tasa: number }>
  prestamos: Array<{ id: string; nombre: string; monto: number; tasa: number }>
  metasAhorro: SavingsGoal[]
  moneda: Currency
}

export function FinanceApp() {
  const [userName, setUserName] = useState<string>("")
  const [showAuth, setShowAuth] = useState(false)
  const [data, setData] = useState<FinancialData>({
    ingresos: [],
    gastos: [],
    deudas: [],
    prestamos: [],
    metasAhorro: [],
    moneda: "CLP",
  })

  useEffect(() => {
    const savedName = localStorage.getItem("userName")
    const savedData = localStorage.getItem("financialData")

    if (savedName) setUserName(savedName)
    if (savedData) setData(JSON.parse(savedData))
  }, [])

  useEffect(() => {
    if (userName) {
      localStorage.setItem("userName", userName)
    }
    localStorage.setItem("financialData", JSON.stringify(data))
  }, [userName, data])

  const addIngreso = (nombre: string, monto: number) => {
    if (nombre && monto > 0) {
      setData({
        ...data,
        ingresos: [...data.ingresos, { id: Date.now().toString(), nombre, monto }],
      })
    }
  }

  const addGasto = (nombre: string, monto: number) => {
    if (nombre && monto > 0) {
      setData({
        ...data,
        gastos: [...data.gastos, { id: Date.now().toString(), nombre, monto }],
      })
    }
  }

  const addDeuda = (nombre: string, monto: number, tasa: number) => {
    if (nombre && monto > 0) {
      setData({
        ...data,
        deudas: [...data.deudas, { id: Date.now().toString(), nombre, monto, tasa }],
      })
    }
  }

  const addPrestamo = (nombre: string, monto: number, tasa: number) => {
    if (nombre && monto > 0) {
      setData({
        ...data,
        prestamos: [...data.prestamos, { id: Date.now().toString(), nombre, monto, tasa }],
      })
    }
  }

  const addMetaAhorro = (titulo: string, metaMonto: number) => {
    if (titulo && metaMonto > 0) {
      setData({
        ...data,
        metasAhorro: [
          ...data.metasAhorro,
          {
            id: Date.now().toString(),
            titulo,
            metaMonto,
            montoActual: 0,
          },
        ],
      })
    }
  }

  const updateMetaAhorro = (id: string, montoActual: number) => {
    setData({
      ...data,
      metasAhorro: data.metasAhorro.map((meta) => (meta.id === id ? { ...meta, montoActual } : meta)),
    })
  }

  const removeMetaAhorro = (id: string) => {
    setData({
      ...data,
      metasAhorro: data.metasAhorro.filter((meta) => meta.id !== id),
    })
  }

  const removeItem = (type: keyof FinancialData, id: string) => {
    if (Array.isArray(data[type])) {
      setData({
        ...data,
        [type]: (data[type] as any[]).filter((item) => item.id !== id),
      })
    }
  }

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("userName")
      localStorage.removeItem("financialData")
      setUserName("")
      setData({
        ingresos: [],
        gastos: [],
        deudas: [],
        prestamos: [],
        metasAhorro: [],
        moneda: "CLP",
      })
      setShowAuth(true)
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
      deudas: data.deudas.map((item) => ({
        ...item,
        monto: convertCurrency(item.monto, oldCurrency, newCurrency),
      })),
      prestamos: data.prestamos.map((item) => ({
        ...item,
        monto: convertCurrency(item.monto, oldCurrency, newCurrency),
      })),
      metasAhorro: data.metasAhorro.map((meta) => ({
        ...meta,
        metaMonto: convertCurrency(meta.metaMonto, oldCurrency, newCurrency),
        montoActual: convertCurrency(meta.montoActual, oldCurrency, newCurrency),
      })),
    }

    setData(convertedData)
  }

  if (showAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthForms />
          <Button variant="ghost" onClick={() => setShowAuth(false)} className="w-full mt-4">
            Volver sin iniciar sesión
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
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
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="ingresos" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Ingresos</span>
            </TabsTrigger>
            <TabsTrigger value="gastos" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Gastos</span>
            </TabsTrigger>
            <TabsTrigger value="deudas" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Deudas</span>
            </TabsTrigger>
            <TabsTrigger value="prestamos" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Préstamos</span>
            </TabsTrigger>
            <TabsTrigger value="metas" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Metas</span>
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
                  type="gasto"
                  currency={data.moneda}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deudas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Deudas</CardTitle>
                <CardDescription>Organiza tus deudas para tener claridad</CardDescription>
              </CardHeader>
              <CardContent>
                <DeudaForm onAdd={addDeuda} currency={data.moneda} />
                <DeudaList items={data.deudas} onRemove={(id) => removeItem("deudas", id)} currency={data.moneda} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prestamos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Préstamos</CardTitle>
                <CardDescription>Gestiona los préstamos que has otorgado</CardDescription>
              </CardHeader>
              <CardContent>
                <PrestamoForm onAdd={addPrestamo} currency={data.moneda} />
                <DeudaList
                  items={data.prestamos}
                  onRemove={(id) => removeItem("prestamos", id)}
                  currency={data.moneda}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Metas de Ahorro</CardTitle>
                <CardDescription>Crea y gestiona tus objetivos financieros personales</CardDescription>
              </CardHeader>
              <CardContent>
                <SavingsGoals
                  metas={data.metasAhorro}
                  onAdd={addMetaAhorro}
                  onUpdate={updateMetaAhorro}
                  onRemove={removeMetaAhorro}
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
  const [monto, setMonto] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(nombre, Number.parseFloat(monto))
    setNombre("")
    setMonto("")
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
            type="number"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            step="0.01"
            min="0"
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
  const [monto, setMonto] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(nombre, Number.parseFloat(monto))
    setNombre("")
    setMonto("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gasto-nombre">Tipo de gasto</Label>
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
            type="number"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            step="0.01"
            min="0"
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Agregar Gasto
      </Button>
    </form>
  )
}

function DeudaForm({
  onAdd,
  currency,
}: { onAdd: (nombre: string, monto: number, tasa: number) => void; currency: string }) {
  const [nombre, setNombre] = useState("")
  const [monto, setMonto] = useState("")
  const [tasa, setTasa] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(nombre, Number.parseFloat(monto), Number.parseFloat(tasa))
    setNombre("")
    setMonto("")
    setTasa("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="deuda-nombre">Nombre de la deuda</Label>
          <Input
            id="deuda-nombre"
            placeholder="Ej: Tarjeta de crédito..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deuda-monto">Monto total ({currency})</Label>
          <Input
            id="deuda-monto"
            type="number"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            step="0.01"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deuda-tasa">Tasa de interés (%)</Label>
          <Input
            id="deuda-tasa"
            type="number"
            placeholder="0.0"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            required
            step="0.1"
            min="0"
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Agregar Deuda
      </Button>
    </form>
  )
}

function PrestamoForm({
  onAdd,
  currency,
}: { onAdd: (nombre: string, monto: number, tasa: number) => void; currency: string }) {
  const [nombre, setNombre] = useState("")
  const [monto, setMonto] = useState("")
  const [tasa, setTasa] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(nombre, Number.parseFloat(monto), Number.parseFloat(tasa))
    setNombre("")
    setMonto("")
    setTasa("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="prestamo-nombre">Nombre del préstamo</Label>
          <Input
            id="prestamo-nombre"
            placeholder="Ej: Préstamo a Juan..."
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prestamo-monto">Monto prestado ({currency})</Label>
          <Input
            id="prestamo-monto"
            type="number"
            placeholder="0.00"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            step="0.01"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prestamo-tasa">Tasa de interés (%)</Label>
          <Input
            id="prestamo-tasa"
            type="number"
            placeholder="0.0"
            value={tasa}
            onChange={(e) => setTasa(e.target.value)}
            required
            step="0.1"
            min="0"
          />
        </div>
      </div>
      <Button type="submit" className="w-full md:w-auto">
        Agregar Préstamo
      </Button>
    </form>
  )
}

function ItemList({
  items,
  onRemove,
  type,
  currency,
}: { items: any[]; onRemove: (id: string) => void; type: string; currency: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tienes {type}s registrados aún</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
          <div>
            <p className="font-medium">{item.nombre}</p>
            <p className="text-2xl font-light mt-1">{formatCurrency(item.monto)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
            Eliminar
          </Button>
        </div>
      ))}
    </div>
  )
}

function DeudaList({ items, onRemove, currency }: { items: any[]; onRemove: (id: string) => void; currency: string }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No tienes elementos registrados aún</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (currency === "CLP") {
      return `$${amount.toLocaleString("es-CL", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    }
    return `${currency} ${amount.toFixed(2)}`
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-lg">
          <div>
            <p className="font-medium">{item.nombre}</p>
            <p className="text-2xl font-light mt-1">{formatCurrency(item.monto)}</p>
            <p className="text-sm text-muted-foreground mt-1">Interés: {item.tasa}%</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>
            Eliminar
          </Button>
        </div>
      ))}
    </div>
  )
}

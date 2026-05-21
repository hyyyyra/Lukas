"use client"

import { useState, useEffect } from "react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import { Sparkles, LogOut, Settings, Sun, Moon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Label } from "@/src/components/ui/label"

interface WelcomeHeaderProps {
  userName: string
  setUserName: (name: string) => void
  currency: "CLP" | "USD" | "EUR"
  onCurrencyChange: (currency: "CLP" | "USD" | "EUR") => void
  onLogout?: () => void
}

export function WelcomeHeader({ userName, setUserName, currency, onCurrencyChange, onLogout }: WelcomeHeaderProps) {
  const { theme, setTheme } = useTheme()
  // Solo mostrar edición si no hay nombre de usuario (usuario no logueado/sin nombre)
  const [isEditing, setIsEditing] = useState(false)
  const [tempName, setTempName] = useState(userName)

  useEffect(() => {
    if (!userName) {
      setIsEditing(true)
    } else {
      setIsEditing(false)
    }
  }, [userName])

  const handleSave = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim())
      setIsEditing(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Buenos días"
    if (hour < 19) return "Buenas tardes"
    return "Buenas noches"
  }

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case "CLP":
        return "$"
      case "USD":
        return "$"
      case "EUR":
        return "€"
      default:
        return ""
    }
  }

  if (isEditing) {
    return (
      <Card className="p-8 mb-8 bg-gradient-to-br from-secondary/20 to-accent/30">
        <div className="max-w-md mx-auto text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-secondary" />
          <h2 className="text-2xl font-light">Bienvenido/a</h2>
          <p className="text-muted-foreground">¿Cómo te gustaría que te llamemos?</p>
          <div className="flex gap-2">
            <Input
              placeholder="Tu nombre"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="text-center"
            />
            <Button onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Configuración</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuraciones</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <Label>Tema de la aplicación</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "secondary" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                    Claro
                  </Button>
                  <Button
                    variant={theme === "dark" ? "secondary" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                    Oscuro
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Moneda principal</Label>
                <Select value={currency} onValueChange={onCurrencyChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>
                      {getCurrencySymbol(currency)} {currency}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLP">$ CLP</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {onLogout && (
          <Button variant="ghost" size="sm" onClick={onLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-light mb-2 text-balance">
          {getGreeting()}, {userName}
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">Organiza tus finanzas de manera simple y tranquila con Lukas</p>
        {!onLogout && (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="mt-2">
            Cambiar nombre
          </Button>
        )}
      </div>
    </div>
  )
}

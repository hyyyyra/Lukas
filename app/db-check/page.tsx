"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw, Database } from "lucide-react"
import { DB_CONFIG } from "@/lib/database-config"

export default function DbCheckPage() {
  const [status, setStatus] = useState<"checking" | "connected" | "error" | "idle">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const checkConnection = async () => {
    setStatus("checking")
    setMessage("Verificando conexión...")
    setDetails(null)

    try {
      const response = await fetch("/api/db-check", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      setStatus("connected")
      setMessage(data.message || "Conexión exitosa a la base de datos")
      setDetails(data)
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "No se pudo conectar con la base de datos")
      setDetails({ error: error.toString() })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Verificación de Base de Datos</h1>
          <p className="text-muted-foreground">Comprueba el estado de tu conexión con MySQL</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado de Conexión
            </CardTitle>
            <CardDescription>Base de datos: {DB_CONFIG.database}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkConnection} disabled={status === "checking"} className="w-full">
              {status === "checking" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Verificar Conexión
                </>
              )}
            </Button>

            {status !== "idle" && (
              <div className="space-y-4">
                <div
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    status === "connected"
                      ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                      : status === "error"
                        ? "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
                        : "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {status === "connected" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  ) : status === "error" ? (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        status === "connected"
                          ? "text-green-900 dark:text-green-100"
                          : status === "error"
                            ? "text-red-900 dark:text-red-100"
                            : "text-blue-900 dark:text-blue-100"
                      }`}
                    >
                      {message}
                    </p>
                    {details && (
                      <pre className="mt-2 text-xs overflow-auto p-2 bg-background/50 rounded border">
                        {JSON.stringify(details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>

                {status === "error" && (
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="font-medium">Posibles soluciones:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Verifica que MySQL esté ejecutándose en localhost:3306</li>
                      <li>Confirma que las variables de entorno en .env.local sean correctas</li>
                      <li>Asegúrate de que la base de datos exista</li>
                      <li>Revisa las credenciales de conexión (usuario/contraseña)</li>
                      <li>Ejecuta el script SQL para crear la tabla usuarios</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Variables de entorno configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">DB_HOST</span>
                <span className="text-muted-foreground">{DB_CONFIG.host}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">DB_PORT</span>
                <span className="text-muted-foreground">{DB_CONFIG.port}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">DB_DATABASE</span>
                <span className="text-muted-foreground">{DB_CONFIG.database}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">DB_USER</span>
                <span className="text-muted-foreground">{DB_CONFIG.user}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

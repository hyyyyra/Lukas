"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { apiClient } from "@/src/lib/api-client"
import { saveAuthSession } from "@/src/lib/auth-session"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export function AuthForms() {
  const router = useRouter()
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerApellidos, setRegisterApellidos] = useState("")

  const [loginStatus, setLoginStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [registerStatus, setRegisterStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginStatus("loading")
    setErrorMessage("")

    try {
      const response = await apiClient.login(loginEmail, loginPassword)
      if (!response.token) {
        throw new Error("No se recibió el token de sesión")
      }
      saveAuthSession(response.token, response.refreshToken)
      setLoginStatus("success")

      // Guardar información del usuario
      if (response.user) {
        const userName = `${response.user.nombre} ${response.user.apellidos || ''}`.trim()
        localStorage.setItem("userName", userName)
      }

      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      setLoginStatus("error")
      setErrorMessage(error.message || "Error al iniciar sesión")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterStatus("loading")
    setErrorMessage("")

    try {
      const fullName = `${registerName} ${registerApellidos}`.trim()
      const response = await apiClient.register(fullName, registerEmail, registerPassword)
      if (!response.token) {
        throw new Error("No se recibió el token de sesión")
      }
      saveAuthSession(response.token, response.refreshToken)
      setRegisterStatus("success")

      // Guardar información del usuario
      if (response.user) {
        const userName = `${response.user.nombre} ${response.user.apellidos || ''}`.trim()
        localStorage.setItem("userName", userName)
      }

      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      setRegisterStatus("error")
      setErrorMessage(error.message || "Error al crear la cuenta")
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
        <CardDescription className="text-center">Ingresa o crea tu cuenta</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loginStatus === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loginStatus === "loading"}
                />
              </div>

              {loginStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {loginStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <p>Inicio de sesión exitoso. Redirigiendo...</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loginStatus === "loading" || loginStatus === "success"}
              >
                {loginStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre</Label>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Tu nombre"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                  disabled={registerStatus === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-apellidos">Apellidos</Label>
                <Input
                  id="register-apellidos"
                  type="text"
                  placeholder="Tus apellidos"
                  value={registerApellidos}
                  onChange={(e) => setRegisterApellidos(e.target.value)}
                  required
                  disabled={registerStatus === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                  disabled={registerStatus === "loading"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  disabled={registerStatus === "loading"}
                />
              </div>

              {registerStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {registerStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  <p>Cuenta creada exitosamente. Redirigiendo...</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={registerStatus === "loading" || registerStatus === "success"}
              >
                {registerStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

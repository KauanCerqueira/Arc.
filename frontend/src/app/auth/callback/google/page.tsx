"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const errorParam = searchParams.get("error")

      if (errorParam) {
        setError("Falha na autenticação com Google")
        setTimeout(() => router.push("/login"), 3000)
        return
      }

      if (!code) {
        setError("Código de autorização não encontrado")
        setTimeout(() => router.push("/login"), 3000)
        return
      }

      try {
        const response = await fetch("/api/auth/oauth/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirectUri: window.location.origin + "/auth/callback/google"
          }),
        })

        if (!response.ok) {
          throw new Error("Falha na autenticação")
        }

        const data = await response.json()

        // Salvar token e dados do usuário
        localStorage.setItem("token", data.token)
        localStorage.setItem("refreshToken", data.refreshToken)
        localStorage.setItem("user", JSON.stringify({
          userId: data.userId,
          nome: data.nome,
          sobrenome: data.sobrenome,
          email: data.email,
          icone: data.icone,
          isMaster: data.isMaster
        }))

        // Configurar integração automática
        await fetch("/api/google/configure", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`
          },
          body: JSON.stringify({
            accessToken: code, // Você pode precisar obter o access_token real aqui
            syncCalendar: true,
            syncTasks: true,
            syncDrive: false,
            syncDocs: false,
            syncSheets: false,
            syncGmail: false,
            syncContacts: false
          })
        })

        // Redirecionar para workspace
        router.push("/workspace")
      } catch (err) {
        console.error("Erro ao processar callback:", err)
        setError("Erro ao autenticar com Google")
        setTimeout(() => router.push("/login"), 3000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-red-500 text-lg font-medium">{error}</div>
            <div className="text-sm text-gray-500">Redirecionando para login...</div>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
            <div className="text-lg font-medium">Autenticando com Google...</div>
            <div className="text-sm text-gray-500">Por favor, aguarde</div>
          </div>
        )}
      </div>
    </div>
  )
}

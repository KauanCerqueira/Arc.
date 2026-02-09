"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/core/store/authStore";
import workspaceInviteService from "@/core/services/workspace-invite.service";
import type { WorkspaceInvite } from "@/core/types/workspace.types";
import { Shield, Users, CheckCircle, AlertCircle, Loader2, ArrowRight, LogIn } from "lucide-react";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  const { user, isAuthenticated } = useAuthStore();

  const [invite, setInvite] = useState<WorkspaceInvite | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      validateInvite();
    }
  }, [token]);

  const validateInvite = async () => {
    setIsValidating(true);
    setError(null);

    try {
      const response = await workspaceInviteService.validateInvite(token);

      if (response.isValid && response.invite) {
        setInvite(response.invite);
      } else {
        setError(response.error || "Convite inválido ou expirado");
      }
    } catch (err) {
      setError("Erro ao validar convite");
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!isAuthenticated) {
      // Redirecionar para login/registro com redirect de volta
      localStorage.setItem("pendingInvite", token);
      router.push(`/login?redirect=/invite/${token}`);
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      const response = await workspaceInviteService.acceptInvite({ token });

      if (response.success) {
        setSuccess(true);
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push(`/workspace?id=${response.workspaceId}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Erro ao aceitar convite");
    } finally {
      setIsAccepting(false);
    }
  };

  // Loading state
  if (isValidating) {
    return (
      <div className="min-h-screen bg-arc-primary flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-arc opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-arc border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-bold text-arc">Validando convite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !invite) {
    return (
      <div className="min-h-screen bg-arc-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-arc-secondary border-2 border-arc rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-arc mb-4">Convite Inválido</h1>
          <p className="text-arc-muted mb-8">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-arc text-arc-primary font-bold hover:opacity-90 transition-all"
          >
            Ir para Home
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-arc-primary flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-arc-secondary border-2 border-arc rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-arc mb-4">Bem-vindo!</h1>
          <p className="text-arc-muted mb-8">
            Você agora é membro do workspace <strong>{invite?.workspaceName}</strong>
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-arc-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Redirecionando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Main invite page
  return (
    <div className="min-h-screen bg-arc-primary">
      {/* Header */}
      <header className="border-b border-arc bg-arc-primary py-4 px-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Image
            src="/icon/arclogo.svg"
            alt="Arc"
            width={32}
            height={32}
            priority
            className="group-hover:opacity-80 transition-opacity"
          />
          <span className="text-xl font-bold text-arc group-hover:opacity-80 transition-opacity">Arc.</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="max-w-lg w-full">
          {/* Invite Card */}
          <div className="bg-arc-secondary border-2 border-arc rounded-2xl p-8 lg:p-12 mb-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-arc rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-arc-primary" strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-extrabold text-arc mb-4">
                Você foi convidado!
              </h1>
              <p className="text-lg text-arc-muted">
                <strong>{invite?.createdByName}</strong> convidou você para se juntar ao workspace
              </p>
            </div>

            {/* Workspace Info */}
            <div className="bg-arc-primary border-2 border-arc rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-arc rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-arc-primary" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-arc truncate">{invite?.workspaceName}</h2>
                  <p className="text-sm text-arc-muted">Workspace</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className={`px-3 py-1.5 rounded-full font-bold uppercase ${
                  invite?.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  invite?.role === 'member' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {invite?.role}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border-2 border-red-500 rounded-xl p-4 mb-6 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" strokeWidth={2.5} />
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleAcceptInvite}
                    disabled={isAccepting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-arc text-arc-primary font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAccepting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                        Aceitar Convite
                        <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-arc-muted">
                    Conectado como <strong>{user?.nome} {user?.sobrenome}</strong>
                  </p>
                </>
              ) : (
                <>
                  <Link
                    href={`/register?invite=${token}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-arc text-arc-primary font-bold hover:opacity-90 transition-all"
                  >
                    Criar Conta e Aceitar
                    <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                  </Link>
                  <Link
                    href={`/login?redirect=/invite/${token}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-arc text-arc font-bold hover:bg-arc-secondary transition-all"
                  >
                    <LogIn className="w-5 h-5" strokeWidth={2.5} />
                    Já tenho conta
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Info Footer */}
          <div className="text-center text-sm text-arc-muted">
            <p>
              Ao aceitar este convite, você concorda com os{" "}
              <Link href="/terms" className="text-arc font-semibold hover:underline">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

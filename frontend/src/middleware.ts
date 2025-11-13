import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/pricing',
  '/terms',
  '/privacy',
  '/build-in-public',
];

// Rotas que só podem ser acessadas quando NÃO autenticado
const AUTH_ROUTES = ['/login', '/register'];

// Rotas que requerem autenticação (workspace)
const PROTECTED_ROUTES_PREFIX = [
  '/workspace',
  '/team',
  '/analytics',
  '/integrations',
  '/settings',
  '/profile',
  '/notifications',
  '/master',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se tem token (básico - verificação completa é feita no client)
  const token = request.cookies.get('auth_token')?.value;
  const isAuthenticated = !!token;

  // Verificar se a rota é pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname === route);

  // Verificar se a rota é de autenticação (login/register)
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  // Verificar se a rota requer proteção
  const isProtectedRoute = PROTECTED_ROUTES_PREFIX.some(prefix =>
    pathname.startsWith(prefix)
  );

  // Se está autenticado e tentando acessar login/register, redirecionar para workspace
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/workspace', request.url));
  }

  // Se NÃO está autenticado e tentando acessar rota protegida, redirecionar para login
  if (!isAuthenticated && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // Salvar URL de destino para redirecionar após login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Permitir acesso
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir acesso livre a todas as rotas públicas
  const publicRoutes = [
    '/cardapio',
    '/carrinho',
    '/checkout',
    '/pedidos',
    '/admin/login',
    '/login',
  ];

  // Se for rota pública, permitir acesso
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Não redirecionar automaticamente outras rotas - deixar as páginas decidirem o que fazer
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
  ],
};


import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const restaurantSlug = requestUrl.searchParams.get('restaurant');

  if (code) {
    // Trocar o código por uma sessão usando o helper do @supabase/ssr
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignorar erro se cookie já foi setado
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Ignorar erro
            }
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Erro ao trocar code por sessão:', error);
      // IMPORTANTE: Versiory não tem login de cliente
      // Redirecionar apenas se houver contexto de restaurante
      if (restaurantSlug) {
        return NextResponse.redirect(new URL(`/restaurante/${restaurantSlug}/cliente/login?error=auth_failed`, request.url));
      }
      // Versiory: redirecionar para home em caso de erro
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Se houver um slug de restaurante, redirecionar para a página do restaurante
  if (restaurantSlug) {
    return NextResponse.redirect(new URL(`/restaurante/${restaurantSlug}`, request.url));
  }

  // Caso contrário, redirecionar para a página de pedidos padrão
  return NextResponse.redirect(new URL('/pedidos', request.url));
}

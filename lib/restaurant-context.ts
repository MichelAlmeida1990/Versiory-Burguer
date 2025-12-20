/**
 * Funções helper para preservar contexto de restaurante em multi-tenancy
 * Garante que Tom & Jerry e Versiory nunca se misturem
 */

/**
 * Obtém o slug do restaurante atual (query param ou localStorage)
 */
export function getRestaurantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Primeiro, tentar obter da URL atual
  const urlParams = new URLSearchParams(window.location.search);
  const slugFromQuery = urlParams.get('restaurant');
  if (slugFromQuery) {
    // Salvar no localStorage para persistência
    localStorage.setItem('lastRestaurantContext', slugFromQuery);
    return slugFromQuery;
  }
  
  // Se não tiver na query, tentar do pathname
  const pathMatch = window.location.pathname.match(/^\/restaurante\/([^/]+)/);
  if (pathMatch && pathMatch[1]) {
    const slugFromPath = pathMatch[1];
    localStorage.setItem('lastRestaurantContext', slugFromPath);
    return slugFromPath;
  }
  
  // Por último, tentar do localStorage
  return localStorage.getItem('lastRestaurantContext');
}

/**
 * Adiciona o contexto do restaurante a uma URL
 */
export function withRestaurantContext(path: string, slug?: string | null): string {
  const restaurantSlug = slug || getRestaurantSlug();
  
  if (!restaurantSlug) {
    return path;
  }
  
  // Se já tiver query params, adicionar com &
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}restaurant=${restaurantSlug}`;
}

/**
 * Remove o contexto do restaurante (para limpar quando sair)
 */
export function clearRestaurantContext(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('lastRestaurantContext');
  }
}

/**
 * Verifica se está em contexto de restaurante específico
 */
export function isRestaurantContext(): boolean {
  return !!getRestaurantSlug();
}

/**
 * Obtém a URL completa preservando contexto
 */
export function getContextualUrl(path: string, slug?: string | null): string {
  // Se o path já começar com /restaurante/[slug], não adicionar query param
  if (path.match(/^\/restaurante\/[^/]+/)) {
    return path;
  }
  
  return withRestaurantContext(path, slug);
}


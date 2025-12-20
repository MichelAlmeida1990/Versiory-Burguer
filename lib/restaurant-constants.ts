/**
 * CONSTANTES DE RESTAURANTES
 * 
 * Este arquivo define os UUIDs dos restaurantes para garantir isolamento total
 * entre Versiory (demo) e Tom & Jerry.
 */

// UUID do Versiory Delivery (Demo)
export const DEMO_RESTAURANT_UUID = "f5f457d9-821e-4a21-9029-e181b1bee792";

// UUID do Tom & Jerry (obter do banco - será definido dinamicamente)
// Para obter: SELECT id FROM auth.users WHERE email = 'tomjerry@gmail.com';
export const TOM_JERRY_RESTAURANT_EMAIL = "tomjerry@gmail.com";

/**
 * Verifica se um UUID pertence ao restaurante demo (Versiory)
 */
export function isDemoRestaurant(restaurantId: string | null | undefined): boolean {
  if (!restaurantId) return false;
  return String(restaurantId).trim() === DEMO_RESTAURANT_UUID;
}

/**
 * Verifica se um UUID pertence ao Tom & Jerry
 * Nota: Isso requer buscar o UUID do banco, então é uma função auxiliar
 */
export function isTomJerryRestaurant(restaurantId: string | null | undefined, tomJerryUuid?: string): boolean {
  if (!restaurantId || !tomJerryUuid) return false;
  return String(restaurantId).trim() === String(tomJerryUuid).trim();
}

/**
 * Garante que produtos não sejam misturados entre restaurantes
 */
export function validateRestaurantIsolation(
  items: Array<{ restaurant_id?: string | null }>,
  expectedRestaurantId: string | null
): { valid: boolean; error?: string } {
  if (!expectedRestaurantId) {
    return { valid: false, error: "Restaurante não identificado" };
  }

  const expectedId = String(expectedRestaurantId).trim();
  const itemsWithRestaurant = items.filter(item => item.restaurant_id);
  
  if (itemsWithRestaurant.length === 0) {
    return { valid: true }; // Produtos sem restaurante são aceitos (legado)
  }

  // Verificar se todos os produtos pertencem ao mesmo restaurante esperado
  const allMatch = itemsWithRestaurant.every(item => {
    const itemRestaurantId = String(item.restaurant_id).trim();
    return itemRestaurantId === expectedId;
  });

  if (!allMatch) {
    return {
      valid: false,
      error: "Produtos de restaurantes diferentes detectados. Por favor, faça pedidos separados."
    };
  }

  return { valid: true };
}





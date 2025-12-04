import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, SelectedOption } from '@/lib/supabase';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, observations?: string, selectedOptions?: SelectedOption[], totalPrice?: number) => void;
  removeItem: (productId: string, selectedOptions?: SelectedOption[]) => void;
  updateQuantity: (productId: string, quantity: number, selectedOptions?: SelectedOption[]) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, observations, selectedOptions, totalPrice) => {
        const items = get().items;
        // Se houver opções, criar um item único (mesmo produto com opções diferentes = item diferente)
        const itemKey = selectedOptions && selectedOptions.length > 0
          ? `${product.id}-${JSON.stringify(selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`
          : product.id;
        
        const existingItem = items.find((item) => {
          if (item.selectedOptions && selectedOptions) {
            const itemKey2 = `${item.product.id}-${JSON.stringify(item.selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`;
            return itemKey === itemKey2;
          }
          return item.product.id === product.id && !item.selectedOptions && !selectedOptions;
        });
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item === existingItem
                ? { ...item, quantity: item.quantity + quantity, observations }
                : item
            ),
          });
        } else {
          // Usar preço total se fornecido, senão usar preço base
          const finalPrice = totalPrice || product.price;
          set({
            items: [...items, { 
              product, 
              quantity, 
              observations, 
              selectedOptions: selectedOptions || undefined,
              // Armazenar preço calculado para exibição
              calculatedPrice: finalPrice
            }],
          });
        }
      },
      removeItem: (productId, selectedOptions?: SelectedOption[]) => {
        const items = get().items;
        if (selectedOptions && selectedOptions.length > 0) {
          // Remover item específico com opções
          const itemKey = `${productId}-${JSON.stringify(selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`;
          set({
            items: items.filter((item) => {
              if (item.selectedOptions && item.selectedOptions.length > 0) {
                const itemKey2 = `${item.product.id}-${JSON.stringify(item.selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`;
                return itemKey !== itemKey2;
              }
              return true;
            }),
          });
        } else {
          // Remover primeiro item sem opções
          set({
            items: items.filter((item) => {
              if (item.product.id === productId && (!item.selectedOptions || item.selectedOptions.length === 0)) {
                return false;
              }
              return true;
            }),
          });
        }
      },
      updateQuantity: (productId, quantity, selectedOptions?: SelectedOption[]) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedOptions);
          return;
        }
        const items = get().items;
        if (selectedOptions && selectedOptions.length > 0) {
          // Atualizar quantidade de item específico com opções
          const itemKey = `${productId}-${JSON.stringify(selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`;
          set({
            items: items.map((item) => {
              if (item.selectedOptions && item.selectedOptions.length > 0) {
                const itemKey2 = `${item.product.id}-${JSON.stringify(item.selectedOptions.sort((a, b) => a.option_id.localeCompare(b.option_id)))}`;
                if (itemKey === itemKey2) {
                  return { ...item, quantity };
                }
              }
              return item;
            }),
          });
        } else {
          // Atualizar quantidade de primeiro item sem opções
          set({
            items: items.map((item) => {
              if (item.product.id === productId && (!item.selectedOptions || item.selectedOptions.length === 0)) {
                return { ...item, quantity };
              }
              return item;
            }),
          });
        }
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((total, item) => {
          // Se houver preço calculado (com opções), usar ele, senão usar preço base
          const itemPrice = (item as any).calculatedPrice || item.product.price;
          return total + itemPrice * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);








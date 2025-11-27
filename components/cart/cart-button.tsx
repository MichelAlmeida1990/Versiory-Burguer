"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Link
      href="/carrinho"
      className="relative inline-flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition"
    >
      <ShoppingCart className="w-6 h-6 text-gray-700" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
}


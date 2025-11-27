"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/images/produtos/logo.jpg"
            alt="Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <span className="text-2xl font-bold text-red-600">
            Versiory Burguer
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="#inicio"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Início
          </Link>
          <Link
            href="#cardapio"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Cardápio
          </Link>
          <Link
            href="#combos"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Combos
          </Link>
          <Link
            href="/pedidos"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Meus Pedidos
          </Link>
          <Link
            href="/admin"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Admin
          </Link>
        </nav>

        {/* Right Side - Cart and Button */}
        <div className="flex items-center space-x-4">
          <CartButton />
          <Link
            href="/carrinho"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Fazer Pedido
          </Link>
        </div>
      </div>
    </header>
  );
}

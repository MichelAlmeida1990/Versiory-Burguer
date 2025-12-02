"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Menu, X } from "lucide-react";
import { CartButton } from "@/components/cart/cart-button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 md:space-x-3">
          <Image
            src="/images/produtos/logo.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="object-contain md:w-[50px] md:h-[50px]"
          />
          <span className="text-lg md:text-2xl font-bold text-red-600">
            Versiory Delivery
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Início
          </Link>
          <Link
            href="/#cardapio"
            className="text-gray-700 hover:text-red-600 font-medium transition"
          >
            Cardápio
          </Link>
          <Link
            href="/#cardapio"
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
        <div className="flex items-center space-x-2 md:space-x-4">
          <CartButton />
          <Link
            href="/carrinho"
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 md:px-6 md:py-2 rounded-lg font-bold transition flex items-center gap-1 md:gap-2 text-sm md:text-base"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Fazer Pedido</span>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-red-600"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-red-600 font-medium transition py-2"
            >
              Início
            </Link>
            <Link
              href="/#cardapio"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-red-600 font-medium transition py-2"
            >
              Cardápio
            </Link>
            <Link
              href="/#cardapio"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-red-600 font-medium transition py-2"
            >
              Combos
            </Link>
            <Link
              href="/pedidos"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-red-600 font-medium transition py-2"
            >
              Meus Pedidos
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-700 hover:text-red-600 font-medium transition py-2"
            >
              Admin
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

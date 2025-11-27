"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CarrinhoPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } =
    useCartStore();
  const [deliveryFee] = useState(5.0);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = getTotal();
  const total = subtotal + deliveryFee - discount;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }
    // Redirecionar para checkout
    window.location.href = "/checkout";
  };

  const applyCoupon = () => {
    // Lógica de cupom (simplificada)
    if (coupon.toUpperCase() === "DEMO10") {
      setDiscount(subtotal * 0.1);
      toast.success("Cupom aplicado! 10% de desconto");
    } else if (coupon) {
      toast.error("Cupom inválido");
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-gray-600" />
          <h2 className="text-3xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-400 mb-8">
            Adicione produtos do cardápio para continuar
          </p>
          <Link
            href="/cardapio"
            className="inline-block bg-primary-yellow text-black px-8 py-4 rounded-lg text-xl font-bold hover:bg-opacity-90 transition"
          >
            Ver Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Carrinho</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Itens do Carrinho */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-gray-900 rounded-lg p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 bg-gray-800 rounded-lg flex-shrink-0">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{item.product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {formatCurrency(item.product.price)} cada
                  </p>
                  {item.observations && (
                    <p className="text-gray-500 text-xs italic mb-2">
                      Obs: {item.observations}
                    </p>
                  )}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-700 rounded-l-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-700 rounded-r-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-yellow">
                    {formatCurrency(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Resumo do Pedido</h2>

              {/* Cupom */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Cupom de Desconto
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Código do cupom"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-yellow"
                  />
                  <button
                    onClick={applyCoupon}
                    className="bg-primary-azure text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* Totais */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxa de Entrega</span>
                  <span>{formatCurrency(deliveryFee)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-primary-yellow">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary-yellow text-black py-4 rounded-lg text-lg font-bold hover:bg-opacity-90 transition"
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


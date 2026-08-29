"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft, PackageOpen } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const { cart, total, itemCount, loading } = useCart();

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff9900] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageOpen className="mb-4 h-16 w-16 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Votre panier est vide
          </h1>
          <p className="mb-6 text-gray-500">
            Decouvrez nos produits et ajoutez vos articles preferes.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e68a00]"
          >
            <ShoppingCart className="h-4 w-4" />
            Parcourir le catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Mon panier</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white px-6">
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                cartItemId={item.id}
                name={item.product.name}
                price={item.unitPrice}
                image={item.product.images?.[0]?.url ?? null}
                quantity={item.quantity}
                stock={item.product.stockQuantity}
              />
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-[#ff9900]"
            >
              <ArrowLeft className="h-4 w-4" />
              Continuer vos achats
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <CartSummary subtotal={total} itemCount={itemCount} />

          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-lg bg-[#ff9900] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#e68a00] hover:shadow-lg"
          >
            Continuer le checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

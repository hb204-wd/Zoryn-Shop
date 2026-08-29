"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import QuantitySelector from "@/components/product/QuantitySelector";

interface CartItemProps {
  cartItemId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

export default function CartItem({
  cartItemId,
  name,
  price,
  image,
  quantity,
  stock,
}: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);

  async function handleQuantityChange(newQuantity: number) {
    setLoading(true);
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await removeItem(cartItemId);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-4 py-4">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            📦
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {name}
          </h3>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50"
            aria-label="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={stock}
          />
          <p className="text-base font-bold text-gray-900">
            {formatPrice(price * quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}

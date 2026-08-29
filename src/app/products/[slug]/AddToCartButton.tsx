"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import QuantitySelector from "@/components/product/QuantitySelector";
import { useCart } from "@/lib/cart-context";

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    const result = await addItem(productId, quantity);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantité :</span>
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          min={1}
          max={99}
        />
      </div>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#e68a00] hover:shadow-lg disabled:opacity-50"
      >
        <ShoppingCart className="h-5 w-5" />
        {added ? "Ajouté au panier !" : "Ajouter au panier"}
      </button>
    </div>
  );
}

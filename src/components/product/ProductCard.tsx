"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import RatingStars from "./RatingStars";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { useState } from "react";

interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand?: string | null;
  rating: number;
  stockQuantity: number;
  images: { url: string; altText?: string | null }[];
}

interface ProductCardProps {
  product: ProductCardProduct;
  showAddToCart?: boolean;
}

export default function ProductCard({
  product,
  showAddToCart = true,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const inStock = product.stockQuantity > 0;
  const mainImage = product.images[0];

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (adding || added) return;
    setAdding(true);
    const result = await addItem(product.id, 1);
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
    setAdding(false);
  }

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`}>
        <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-gray-50">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={mainImage.altText ?? product.name}
              className="h-full w-full object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <span className="text-4xl">📦</span>
            </div>
          )}
          {!inStock && (
            <span className="absolute left-2 top-2 rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-semibold text-white">
              Rupture de stock
            </span>
          )}
        </div>
      </Link>

      <div className="space-y-2">
        {product.brand && (
          <p className="text-xs font-medium text-gray-500">{product.brand}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-[#ff9900]">
            {product.name}
          </h3>
        </Link>
        <RatingStars rating={product.rating} count={undefined} size="sm" showCount={false} />
        <p className="text-lg font-bold text-gray-900">
          {formatPrice(product.price)}
        </p>
        <p className={`text-xs font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
          {inStock ? "En stock" : "Indisponible"}
        </p>
        {showAddToCart && inStock && (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff9900] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#e68a00] disabled:opacity-50"
          >
            <ShoppingCart className="h-4 w-4" />
            {added ? "Ajouté !" : adding ? "Ajout..." : "Ajouter au panier"}
          </button>
        )}
      </div>
    </div>
  );
}

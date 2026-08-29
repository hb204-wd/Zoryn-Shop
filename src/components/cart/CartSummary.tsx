import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export default function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const shippingCost = subtotal >= 50 ? 0 : 4.99;
  const total = subtotal + shippingCost;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Resume</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-gray-400" />
            <span>Livraison estimee</span>
          </div>
          <span>
            {shippingCost === 0 ? (
              <span className="font-medium text-green-600">Gratuite</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

        {shippingCost > 0 && (
          <p className="text-xs text-gray-500">
            Livraison gratuite pour les commandes de plus de 50 EUR
          </p>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-bold text-gray-900">Total</span>
            <span className="text-base font-bold text-gray-900">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

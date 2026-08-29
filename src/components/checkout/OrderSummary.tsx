import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

interface OrderSummaryProps {
  items: OrderItem[];
  shippingCost: number;
}

export default function OrderSummary({ items, shippingCost }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
      <h2 className="mb-4 text-lg font-bold text-gray-900">Recapitulatif</h2>

      <div className="mb-4 max-h-60 space-y-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  📦
                </div>
              )}
            </div>
            <div className="flex flex-1 justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">Qte: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Sous-total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-gray-400" />
            <span>Livraison</span>
          </div>
          <span>
            {shippingCost === 0 ? (
              <span className="font-medium text-green-600">Gratuite</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>

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

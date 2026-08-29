"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const { id } = await params;
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params]);

  useEffect(() => {
    if (order) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: "purchase",
          orderId: order.id,
          amount: order.total,
        }),
      });
    }
  }, [order]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff9900] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="py-20 text-center">
          <p className="text-gray-500">Commande introuvable.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#ff9900] hover:text-[#e68a00]"
          >
            Retour au catalogue <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>

        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Commande confirmee !
        </h1>
        <p className="mb-6 text-gray-500">
          Merci pour votre achat. Votre commande a ete enregistree avec succes.
        </p>

        <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2">
          <Package className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Commande n&deg;</span>
          <span className="text-sm font-bold text-gray-900">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Recapitulatif
          </h2>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-bold text-gray-900">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e68a00]"
        >
          Continuer vos achats
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

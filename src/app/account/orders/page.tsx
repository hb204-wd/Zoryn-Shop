"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { statusLabels } from "@/lib/constants";

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  itemsCount: number;
}

function OrderEmptyState() {
  return (
    <div className="py-16 text-center">
      <ShoppingBag className="mx-auto h-16 w-16 text-gray-300" />
      <h2 className="mt-4 text-lg font-semibold text-gray-900">
        Aucune commande pour le moment
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Vous n&apos;avez pas encore passe de commande sur Zoryn.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e68a00]"
      >
        Decouvrir nos produits
      </Link>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-gray-50 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <nav className="flex items-center gap-1 text-sm text-gray-500">
            <Link href="/account" className="hover:text-gray-700">
              Mon compte
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-gray-900">Mes commandes</span>
          </nav>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <Package className="h-6 w-6 text-[#ff9900]" />
            <h1 className="text-xl font-bold text-gray-900">Mes commandes</h1>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">Chargement...</div>
          ) : orders.length === 0 ? (
            <OrderEmptyState />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const st = statusLabels[order.status] || {
                  label: order.status,
                  color: "bg-gray-100 text-gray-700",
                };
                return (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:border-[#ff9900] hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Package className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.id}
                        </p>
                        <p className="text-xs text-gray-500">{order.date}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {order.total.toFixed(2)} EUR
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.itemsCount} article{order.itemsCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

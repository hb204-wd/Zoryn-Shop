import Link from "next/link";
import { Package, ShoppingCart, BarChart3 } from "lucide-react";

export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Administration</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/products"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#ff9900]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Produits</h2>
            <p className="text-sm text-gray-500">Gerer le catalogue</p>
          </div>
        </Link>
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#ff9900]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500">
            <ShoppingCart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Commandes</h2>
            <p className="text-sm text-gray-500">Suivre les commandes</p>
          </div>
        </Link>
        <Link
          href="/admin/analytics"
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-[#ff9900]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Analytiques</h2>
            <p className="text-sm text-gray-500">Voir les statistiques</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

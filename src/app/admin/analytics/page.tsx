"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Info,
} from "lucide-react";

interface KpiData {
  label: string;
  value: string;
  change: string;
  icon: typeof Eye;
  color: string;
}

interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
}

interface Segment {
  segment: string;
  users: string;
  conversion: string;
  revenue: string;
}

export default function AdminAnalyticsPage() {
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [funnelSteps, setFunnelSteps] = useState<FunnelStep[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        const counts = data.eventCounts || [];
        const summary = data.summary || {};
        const totalEvents = summary.totalEvents || 0;

        const viewCount = counts.find((c: { event: string; count: number }) => c.event === "product_view")?.count || 0;
        const cartCount = counts.find((c: { event: string; count: number }) => c.event === "add_to_cart")?.count || 0;
        const checkoutCount = counts.find((c: { event: string; count: number }) => c.event === "checkout_initiated")?.count || 0;
        const purchaseCount = counts.find((c: { event: string; count: number }) => c.event === "purchase")?.count || 0;

        if (totalEvents === 0) {
          setHasData(false);
          return;
        }

        setHasData(true);

        const cartConversion = viewCount > 0 ? ((cartCount / viewCount) * 100).toFixed(1) : "0.0";
        const checkoutConversion = checkoutCount > 0 ? ((purchaseCount / checkoutCount) * 100).toFixed(1) : "0.0";

        setKpis([
          { label: "Vues produits", value: viewCount.toLocaleString("fr-FR"), change: `+${summary.periodDays || 30}j`, icon: Eye, color: "bg-blue-500" },
          { label: "Ajouts au panier", value: cartCount.toLocaleString("fr-FR"), change: `${cartConversion}%`, icon: ShoppingCart, color: "bg-purple-500" },
          { label: "Checkouts inities", value: checkoutCount.toLocaleString("fr-FR"), change: "", icon: CreditCard, color: "bg-indigo-500" },
          { label: "Achats effectues", value: purchaseCount.toLocaleString("fr-FR"), change: "", icon: TrendingUp, color: "bg-green-500" },
          { label: "Taux de conversion panier", value: `${cartConversion}%`, change: "", icon: Users, color: "bg-yellow-500" },
          { label: "Taux de conversion checkout", value: `${checkoutConversion}%`, change: "", icon: TrendingUp, color: "bg-emerald-500" },
          { label: "Evenements totaux", value: totalEvents.toLocaleString("fr-FR"), change: `${summary.uniqueUsers || 0} users`, icon: DollarSign, color: "bg-[#ff9900]" },
          { label: "Sessions uniques", value: (summary.uniqueSessions || 0).toLocaleString("fr-FR"), change: "", icon: BarChart3, color: "bg-pink-500" },
        ]);

        setFunnelSteps([
          { label: "Vues produits", value: viewCount, percentage: viewCount > 0 ? 100 : 0 },
          { label: "Ajouts au panier", value: cartCount, percentage: viewCount > 0 ? +((cartCount / viewCount) * 100).toFixed(1) : 0 },
          { label: "Checkouts inities", value: checkoutCount, percentage: viewCount > 0 ? +((checkoutCount / viewCount) * 100).toFixed(1) : 0 },
          { label: "Achats effectues", value: purchaseCount, percentage: viewCount > 0 ? +((purchaseCount / viewCount) * 100).toFixed(1) : 0 },
        ]);

        setSegments([
          { segment: "Utilisateurs connectes", users: (summary.uniqueUsers || 0).toLocaleString("fr-FR"), conversion: `${checkoutConversion}%`, revenue: "" },
          { segment: "Sessions uniques", users: (summary.uniqueSessions || 0).toLocaleString("fr-FR"), conversion: "", revenue: "" },
        ]);
      })
      .catch(() => setHasData(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytiques</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <Info className="h-3.5 w-3.5" />
            {hasData === false ? "Aucune donnee disponible" : "Donnees en temps reel"}
          </p>
        </div>
      </div>

      {hasData === false ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Aucune donnee disponible
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Les donnees analytiques apparaissent ici des que des evenements sont enregistres.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {kpi.change && (
                      <span className="text-xs font-semibold text-gray-500">
                        {kpi.change}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-2xl font-bold text-gray-900">{kpi.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{kpi.label}</p>
                </div>
              );
            })}
          </div>

          {/* Funnel */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">Entonnoir de conversion</h2>
            <div className="space-y-4">
              {funnelSteps.map((step) => (
                <div key={step.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">{step.label}</span>
                    <span className="text-gray-500">
                      {step.value.toLocaleString("fr-FR")} ({step.percentage}%)
                    </span>
                  </div>
                  <div className="h-8 w-full overflow-hidden rounded-lg bg-gray-100">
                    <div
                      className="flex h-full items-center rounded-lg bg-[#ff9900] pl-3 text-xs font-semibold text-white transition-all"
                      style={{ width: `${step.percentage}%`, minWidth: step.percentage > 0 ? "3rem" : "0" }}
                    >
                      {step.percentage > 10 && `${step.percentage}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Segmentation Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900">Segmentation</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Segment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Utilisateurs
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Taux de conversion
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {segments.map((seg) => (
                    <tr key={seg.segment} className="transition-colors hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {seg.segment}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {seg.users}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                        {seg.conversion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

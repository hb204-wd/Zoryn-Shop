"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ShippingForm, { type ShippingFormData } from "@/components/checkout/ShippingForm";
import DeliveryMethod, { deliveryOptions } from "@/components/checkout/DeliveryMethod";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, itemCount, loading } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");

  async function handleSubmitShipping(data: ShippingFormData) {
    if (!cart) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: cart.id,
          shippingName: data.name,
          shippingAddress: data.line1,
          shippingCity: data.city,
          shippingZip: data.postalCode,
          shippingCountry: data.country,
          shippingMethod: selectedDelivery,
        }),
      });

      if (res.ok) {
        const order = await res.json();
        router.push(`/order-confirmation/${order.id}`);
      } else {
        const err = await res.json();
        setError(err.error || "Erreur lors de la commande");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  }

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
    router.push("/cart");
    return null;
  }

  const items = cart.items.map((item) => ({
    id: item.productId,
    name: item.product.name,
    price: item.unitPrice,
    quantity: item.quantity,
    image: item.product.images?.[0]?.url ?? null,
  }));

  const selectedShipping =
    deliveryOptions.find((o) => o.id === selectedDelivery)?.price ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Checkout</h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="space-y-6 lg:col-span-2">
          <ShippingForm onSubmit={handleSubmitShipping} />
          <DeliveryMethod selected={selectedDelivery} onSelect={setSelectedDelivery} />

          <button
            type="submit"
            form="checkout-form"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#e68a00] hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Confirmer la commande"
            )}
          </button>
        </div>

        {/* Summary */}
        <div>
          <OrderSummary items={items} shippingCost={selectedShipping} />
        </div>
      </div>
    </div>
  );
}

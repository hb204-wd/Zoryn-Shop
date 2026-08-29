"use client";

import { Truck, Zap, Rocket } from "lucide-react";
import { formatPrice } from "@/lib/format";

export interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  delay: string;
  icon: typeof Truck;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: "standard",
    name: "Standard",
    price: 5.99,
    delay: "5-7 jours ouvrables",
    icon: Truck,
  },
  {
    id: "express",
    name: "Express",
    price: 14.99,
    delay: "2-3 jours ouvrables",
    icon: Zap,
  },
  {
    id: "priority",
    name: "Prioritaire",
    price: 12.99,
    delay: "1 jour ouvrable",
    icon: Rocket,
  },
];

interface DeliveryMethodProps {
  selected: string;
  onSelect: (id: string) => void;
}

export default function DeliveryMethod({ selected, onSelect }: DeliveryMethodProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Mode de livraison</h2>

      {deliveryOptions.map((option) => {
        const Icon = option.icon;
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-all ${
              isSelected
                ? "border-[#ff9900] bg-orange-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                isSelected ? "bg-[#ff9900] text-white" : "bg-gray-100 text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{option.name}</p>
              <p className="text-xs text-gray-500">{option.delay}</p>
            </div>

            <p className="text-sm font-bold text-gray-900">
              {option.price === 0 ? (
                <span className="text-green-600">Gratuite</span>
              ) : (
                `+${formatPrice(option.price)}`
              )}
            </p>
          </button>
        );
      })}
    </div>
  );
}

export { deliveryOptions };

"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < max) onChange(value + 1);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-300">
      <button
        onClick={decrement}
        disabled={value <= min}
        className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= min && val <= max) onChange(val);
        }}
        className="h-10 w-14 border-x border-gray-300 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none"
        min={min}
        max={max}
      />
      <button
        onClick={increment}
        disabled={value >= max}
        className="flex h-10 w-10 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

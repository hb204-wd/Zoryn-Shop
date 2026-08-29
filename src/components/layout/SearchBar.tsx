"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";

const categories = [
  { name: "Tout", slug: "" },
  { name: "Composants", slug: "composants" },
  { name: "Laptops", slug: "laptops" },
  { name: "Ecrans", slug: "ecrans" },
  { name: "Peripheriques", slug: "peripheriques" },
  { name: "Stockage", slug: "stockage" },
  { name: "Accessoires", slug: "accessoires" },
];

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const cat = categories.find((c) => c.name === selectedCategory);
    if (cat && cat.slug) params.set("category", cat.slug);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <form onSubmit={handleSubmit} className="flex">
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex h-12 items-center gap-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {selectedCategory}
            <ChevronDown className="h-4 w-4" />
          </button>
          {dropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des produits, marques, categories..."
          className="h-12 flex-1 border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder-gray-500 focus:border-[#ff9900] focus:outline-none focus:ring-1 focus:ring-[#ff9900]"
        />
        <button
          type="submit"
          className="flex h-12 items-center justify-center rounded-r-lg bg-[#ff9900] px-6 text-white transition-colors hover:bg-[#e68a00]"
        >
          <Search className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

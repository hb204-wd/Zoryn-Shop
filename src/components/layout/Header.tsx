"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  User,
  Package,
  ShoppingCart,
  Menu,
  X,
  Search,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

const categories = [
  { name: "Composants", slug: "composants" },
  { name: "Laptops", slug: "laptops" },
  { name: "Ecrans", slug: "ecrans" },
  { name: "Peripheriques", slug: "peripheriques" },
  { name: "Stockage", slug: "stockage" },
  { name: "Accessoires", slug: "accessoires" },
];

export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory !== "Tout") {
      const cat = categories.find((c) => c.name === selectedCategory);
      if (cat) params.set("category", cat.slug);
    }
    router.push(`/products?${params.toString()}`);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Row 1: Main header */}
      <div className="bg-[#1a2332] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <span className="text-2xl font-bold tracking-tight">
                Zoryn
              </span>
            </Link>

            {/* Search bar - hidden on mobile */}
            <div className="hidden flex-1 max-w-2xl md:flex">
              <div className="relative flex w-full">
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    className="flex h-10 items-center gap-1 rounded-l-lg border border-r-0 border-gray-600 bg-[#243044] px-3 text-sm text-gray-300 hover:bg-[#2c3a50]"
                  >
                    {selectedCategory}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {categoryDropdownOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-gray-600 bg-[#243044] py-1 shadow-lg">
                      {["Tout", ...categories.map((c) => c.name)].map(
                        (cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(cat);
                              setCategoryDropdownOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-[#2c3a50]"
                          >
                            {cat}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Rechercher des produits..."
                  className="h-10 flex-1 border border-gray-600 bg-white px-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="flex h-10 items-center justify-center rounded-r-lg bg-[#ff9900] px-4 text-white hover:bg-[#e68a00]"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right nav links */}
            <nav className="flex items-center gap-1 sm:gap-3">
              <Link
                href="/account"
                className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-[#243044] sm:flex"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden lg:inline">
                  <span className="block text-[10px] text-gray-400">
                    Livrer a
                  </span>
                  France
                </span>
              </Link>
              <Link
                href="/account"
                className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-[#243044] sm:flex"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline">
                  <span className="block text-[10px] text-gray-400">
                    Bonjour, Identifiez-vous
                  </span>
                  Compte
                </span>
              </Link>
              <Link
                href="/account/orders"
                className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-[#243044] sm:flex"
              >
                <Package className="h-4 w-4" />
                <span className="hidden lg:inline">
                  <span className="block text-[10px] text-gray-400">
                    Retours
                  </span>
                  Commandes
                </span>
              </Link>
              <Link
                href="/cart"
                className="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-gray-300 hover:bg-[#243044]"
              >
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {itemCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff9900] text-xs font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Panier</span>
              </Link>

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-gray-300 hover:bg-[#243044] md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Row 2: Category navigation - desktop */}
      <div className="hidden border-b border-gray-700 bg-[#243044] md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-10 items-center gap-1 overflow-x-auto">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/products?category=${category.slug}`}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-[#2c3a50] hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-700 bg-[#243044] md:hidden">
          {/* Mobile search */}
          <div className="p-4">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Rechercher..."
                className="h-10 flex-1 rounded-l-lg border border-gray-600 bg-white px-4 text-sm text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="flex h-10 items-center justify-center rounded-r-lg bg-[#ff9900] px-4 text-white"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile navigation links */}
          <nav className="space-y-1 px-4 pb-4">
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2c3a50]"
            >
              <MapPin className="h-5 w-5" />
              Livrer en France
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2c3a50]"
            >
              <User className="h-5 w-5" />
              Mon Compte
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2c3a50]"
            >
              <Package className="h-5 w-5" />
              Mes Commandes
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-[#2c3a50]"
            >
              <ShoppingCart className="h-5 w-5" />
              Panier
              {itemCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#ff9900] text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile categories */}
          <div className="border-t border-gray-700 px-4 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Categories
            </p>
            <nav className="space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-[#2c3a50]"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

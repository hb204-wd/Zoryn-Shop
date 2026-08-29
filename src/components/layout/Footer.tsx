"use client";

import Link from "next/link";
import { CreditCard, Shield, Truck } from "lucide-react";

const footerLinks = {
  "A propos de Zoryn": [
    { label: "Nos produits", href: "/products" },
    { label: "Composants", href: "/products?category=composants" },
    { label: "Laptops", href: "/products?category=laptops" },
    { label: "Peripheriques", href: "/products?category=peripheriques" },
  ],
  "Moyens de paiement": [
    { label: "Carte bancaire", href: "#" },
    { label: "Virement bancaire", href: "#" },
    { label: "Paiement en 3x sans frais", href: "#" },
    { label: "Carte cadeau", href: "#" },
  ],
  "Besoin d'aide ?": [
    { label: "Suivre mes commandes", href: "/account/orders" },
    { label: "Mon compte", href: "/account" },
    { label: "Panier", href: "/cart" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#1a2332] text-gray-300">
      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-[#243044] py-3 text-sm text-gray-300 transition-colors hover:bg-[#2c3a50]"
      >
        Retour en haut
      </button>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-bold text-white">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#ff9900]" />
              <span>Livraison gratuite des 50 EUR</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#ff9900]" />
              <span>Paiement securise</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff9900]" />
              <span>Garantie 2 ans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-700">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Zoryn. Tous droits reserves.
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link href="#" className="hover:text-gray-300">
                Politique de confidentialite
              </Link>
              <Link href="#" className="hover:text-gray-300">
                Conditions d&apos;utilisation
              </Link>
              <Link href="#" className="hover:text-gray-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

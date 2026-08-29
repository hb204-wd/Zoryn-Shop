import Link from "next/link";
import {
  Cpu,
  Laptop,
  Monitor,
  Keyboard,
  HardDrive,
  Headphones,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Truck,
} from "lucide-react";
import SearchBar from "@/components/layout/SearchBar";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

const categoryIcons: Record<string, typeof Cpu> = {
  composants: Cpu,
  laptops: Laptop,
  ecrans: Monitor,
  peripheriques: Keyboard,
  stockage: HardDrive,
  accessoires: Headphones,
};

const categoryColors: Record<string, string> = {
  composants: "bg-blue-500",
  laptops: "bg-purple-500",
  ecrans: "bg-green-500",
  peripheriques: "bg-red-500",
  stockage: "bg-yellow-500",
  accessoires: "bg-pink-500",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-[#ff9900] text-[#ff9900]"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

interface ProductForCard {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  images: { url: string; altText?: string | null }[];
  badge?: string;
  originalPrice?: number;
  discount?: string;
}

function ProductCard({
  product,
  showDiscount,
}: {
  product: ProductForCard;
  showDiscount?: boolean;
}) {
  const imageUrl = product.images.length > 0 ? product.images[0].url : null;
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-lg"
    >
      <div className="relative mb-4 flex aspect-square items-center justify-center rounded-lg bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images[0].altText || product.name}
            className="h-full w-full object-contain p-2"
          />
        ) : (
          <div className="text-4xl text-gray-300">
            <Zap className="h-12 w-12" />
          </div>
        )}
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-[#ff9900] px-2.5 py-0.5 text-xs font-semibold text-white">
            {product.badge}
          </span>
        )}
        {showDiscount && product.discount && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            {product.discount}
          </span>
        )}
      </div>
      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-[#ff9900]">
        {product.name}
      </h3>
      <div className="mb-2 flex items-center gap-2">
        <StarRating rating={product.rating} />
      </div>
      {showDiscount && product.originalPrice != null && (
        <p className="text-xs text-gray-400 line-through">
          {formatPrice(product.originalPrice)}
        </p>
      )}
      <p className="text-lg font-bold text-gray-900">
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}

export default async function Home() {
  let categories: { id: string; name: string; slug: string }[] = [];
  let featuredProducts: {
    id: string; name: string; slug: string; price: number; rating: number;
    images: { url: string; altText?: string | null }[];
  }[] = [];
  let specialOffers: typeof featuredProducts = [];

  try {
    categories = await db.category.findMany({ orderBy: { name: "asc" } });
    featuredProducts = await db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { rating: "desc" },
      take: 6,
    });
    specialOffers = await db.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
      orderBy: { price: "asc" },
      take: 3,
    });
  } catch {
    // Database not available, show static content
  }

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#1a2332] to-[#2c3a50]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold text-white sm:text-5xl">
              Votre equipement informatique
            </h1>
            <p className="mb-8 text-lg text-gray-300 sm:text-xl">
              Composants, laptops, ecrans et peripheriques aux meilleurs prix
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-[#ff9900]" />
              <span>Livraison gratuite des 50 EUR</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#ff9900]" />
              <span>Garantie 2 ans minimum</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#ff9900]" />
              <span>Expedition sous 24h</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            Nos categories
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = categoryIcons[category.slug] || Cpu;
              const color = categoryColors[category.slug] || "bg-blue-500";
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 text-center transition-all hover:border-[#ff9900] hover:shadow-md"
                >
                  <div className={`${color} rounded-full p-3 text-white transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Produits populaires
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-[#ff9900] hover:text-[#e68a00]"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  rating: product.rating,
                  images: product.images,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Offres speciales
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Profitez de nos meilleures affaires
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-sm font-medium text-[#ff9900] hover:text-[#e68a00]"
            >
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {specialOffers.map((offer) => (
              <ProductCard
                key={offer.id}
                product={{
                  id: offer.id,
                  name: offer.name,
                  slug: offer.slug,
                  price: offer.price,
                  rating: offer.rating,
                  images: offer.images,
                  badge: "Promo",
                }}
                showDiscount
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#ff9900] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Livraison gratuite des 50 EUR
          </h2>
          <p className="mb-6 text-lg text-white/90">
            Expediez vos commandes sous 24h ouvrable
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a2332] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#243044]"
          >
            Commander maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

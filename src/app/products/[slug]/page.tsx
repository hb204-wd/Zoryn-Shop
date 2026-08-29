import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, Shield, RotateCcw, Package } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { trackProductView } from "@/lib/analytics";
import RatingStars from "@/components/product/RatingStars";
import ImageGallery from "@/components/product/ImageGallery";
import ProductCard from "@/components/product/ProductCard";
import ReviewList from "@/components/product/ReviewList";
import AddToCartButton from "./AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || !product.isActive) {
    notFound();
  }

  // Track product view
  trackProductView(product.id).catch(() => {});

  // Get related products (same category, excluding current)
  const relatedProducts = await db.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
    take: 4,
    orderBy: { rating: "desc" },
  });

  const inStock = product.stockQuantity > 0;
  const reviewCount = product.reviews.length;
  const avgRating =
    reviewCount > 0
      ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewCount
      : 0;

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#ff9900]">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-[#ff9900]">
            Produits
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-[#ff9900]"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product detail - two column */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Gallery */}
          <div>
            <ImageGallery images={product.images} />
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="mb-1 text-sm font-medium text-[#ff9900]">
                  {product.brand}
                </p>
              )}
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <RatingStars rating={avgRating} count={reviewCount} size="lg" />
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`}
              />
              <span
                className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}
              >
                {inStock
                  ? `En stock (${product.stockQuantity} disponible${product.stockQuantity > 1 ? "s" : ""})`
                  : "Rupture de stock"}
              </span>
            </div>

            {/* Add to cart */}
            {inStock && (
              <AddToCartButton productId={product.id} />
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[#ff9900]" />
                <span className="text-xs text-gray-600">Livraison gratuite des 50 EUR</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ff9900]" />
                <span className="text-xs text-gray-600">Garantie 2 ans</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[#ff9900]" />
                <span className="text-xs text-gray-600">Retour sous 30 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-[#ff9900]" />
                <span className="text-xs text-gray-600">Expédition sous 24h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Description
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>
          </section>
        )}

        {/* Technical specs */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Caractéristiques
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-700">SKU</td>
                  <td className="px-4 py-3 text-gray-900">{product.sku}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700">
                    Categorie
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {product.category.name}
                  </td>
                </tr>
                {product.brand && (
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">
                      Marque
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {product.brand}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">Prix</td>
                  <td className="px-4 py-3 text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Reviews */}
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Avis clients ({reviewCount})
          </h2>
          <ReviewList reviews={product.reviews} />
        </section>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Produits similaires
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((rp: (typeof relatedProducts)[number]) => (
                <ProductCard key={rp.id} product={rp} showAddToCart={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

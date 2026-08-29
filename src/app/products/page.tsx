import Link from "next/link";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import ProductCard from "@/components/product/ProductCard";
import SortSelect from "./SortSelect";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  inStock?: string;
  sort?: string;
  page?: string;
}>;

const ITEMS_PER_PAGE = 24;

const PRICE_RANGES = [
  { label: "Moins de 50 EUR", min: 0, max: 50 },
  { label: "50 - 100 EUR", min: 50, max: 100 },
  { label: "100 - 250 EUR", min: 100, max: 250 },
  { label: "250 - 500 EUR", min: 250, max: 500 },
  { label: "Plus de 500 EUR", min: 500, max: undefined },
] as const;

function buildHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const merged = { ...params, ...overrides };
  const entries = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => [k, v as string]);
  const qs = new URLSearchParams(entries).toString();
  return `/products${qs ? `?${qs}` : ""}`;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort ?? "newest";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.brand) {
    where.brand = { equals: params.brand };
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
      { brand: { contains: params.q } },
    ];
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }
  if (params.minRating) {
    where.rating = { gte: parseFloat(params.minRating) };
  }
  if (params.inStock === "1") {
    where.stockQuantity = { gt: 0 };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "rating"
          ? { rating: "desc" }
          : sort === "name_asc"
            ? { name: "asc" }
            : { createdAt: "desc" };

  let products: Array<{
    id: string; name: string; slug: string; price: number; rating: number;
    stockQuantity: number; brand?: string | null;
    images: { url: string; altText?: string | null }[];
    category: { id: string; name: string; slug: string };
  }> = [];
  let total = 0;
  let categories: Array<{ id: string; name: string; slug: string }> = [];
  let brands: Array<{ brand: string | null }> = [];

  try {
    [products, total, categories, brands] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          category: true,
        },
        orderBy,
        skip: (page - 1) * ITEMS_PER_PAGE,
        take: ITEMS_PER_PAGE,
      }),
      db.product.count({ where }),
      db.category.findMany({ orderBy: { name: "asc" } }),
      db.product.findMany({
        where: { isActive: true, brand: { not: null } },
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
    ]);
  } catch {
    // Database not available
  }

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const uniqueBrands = brands
    .map((b: { brand: string | null }) => b.brand)
    .filter(Boolean) as string[];
  const currentParams = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== "page")
  );

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#ff9900]">
            Accueil
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Produits</span>
        </nav>

        <div className="flex gap-8">
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtres
                </h3>

                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Categorie
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={buildHref(currentParams, {
                          category: undefined,
                        })}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          !params.category
                            ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Toutes les categories
                      </Link>
                    </li>
                    {categories.map(
                      (cat: { id: string; name: string; slug: string }) => (
                        <li key={cat.id}>
                          <Link
                            href={buildHref(currentParams, {
                              category: cat.slug,
                            })}
                            className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                              params.category === cat.slug
                                ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Marque
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={buildHref(currentParams, { brand: undefined })}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          !params.brand
                            ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Toutes les marques
                      </Link>
                    </li>
                    {uniqueBrands.map((brand) => (
                      <li key={brand}>
                        <Link
                          href={buildHref(currentParams, { brand })}
                          className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                            params.brand === brand
                              ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {brand}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Prix
                  </h4>
                  <ul className="space-y-1">
                    <li>
                      <Link
                        href={buildHref(currentParams, {
                          minPrice: undefined,
                          maxPrice: undefined,
                        })}
                        className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                          !params.minPrice && !params.maxPrice
                            ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        Tous les prix
                      </Link>
                    </li>
                    {PRICE_RANGES.map((range) => (
                      <li key={range.label}>
                        <Link
                          href={buildHref(currentParams, {
                            minPrice: range.min?.toString(),
                            maxPrice: range.max?.toString(),
                          })}
                          className={`block rounded-md px-2 py-1.5 text-sm transition-colors ${
                            params.minPrice === String(range.min) &&
                            params.maxPrice === String(range.max ?? "")
                              ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {range.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Note minimale
                  </h4>
                  <ul className="space-y-1">
                    {[4, 3, 2, 1].map((r) => (
                      <li key={r}>
                        <Link
                          href={buildHref(currentParams, {
                            minRating: r.toString(),
                          })}
                          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition-colors ${
                            params.minRating === String(r)
                              ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span>{r}+</span>
                          <span className="text-[#ff9900]">&#9733;</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Disponibilite
                  </h4>
                  <Link
                    href={buildHref(currentParams, {
                      inStock: params.inStock === "1" ? undefined : "1",
                    })}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      params.inStock === "1"
                        ? "bg-[#ff9900]/10 font-medium text-[#ff9900]"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`h-3.5 w-3.5 rounded border ${
                        params.inStock === "1"
                          ? "border-[#ff9900] bg-[#ff9900]"
                          : "border-gray-300"
                      }`}
                    />
                    En stock uniquement
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {params.q ? `Résultats pour « ${params.q} »` : "Produits"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {total} produit{total !== 1 ? "s" : ""} trouve{total !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm text-gray-600">
                  Trier par
                </label>
                <SortSelect />
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
                <p className="text-lg font-medium text-gray-900">
                  Aucun produit trouve
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Essayez de modifier vos filtres de recherche.
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block rounded-lg bg-[#ff9900] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e68a00]"
                >
                  Reinitialiser les filtres
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product: (typeof products)[number]) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-1">
                <Link
                  href={buildHref(currentParams, {
                    page: Math.max(1, page - 1).toString(),
                  })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    page <= 1
                      ? "pointer-events-none border-gray-200 text-gray-300"
                      : "border-gray-300 text-gray-700 hover:border-[#ff9900] hover:text-[#ff9900]"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
                  )
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-2 text-sm text-gray-400"
                      >
                        &#8230;
                      </span>
                    ) : (
                      <Link
                        key={p}
                        href={buildHref(currentParams, {
                          page: (p as number).toString(),
                        })}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                          p === page
                            ? "border-[#ff9900] bg-[#ff9900] font-semibold text-white"
                            : "border-gray-300 text-gray-700 hover:border-[#ff9900] hover:text-[#ff9900]"
                        }`}
                      >
                        {p}
                      </Link>
                    )
                  )}
                <Link
                  href={buildHref(currentParams, {
                    page: Math.min(totalPages, page + 1).toString(),
                  })}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    page >= totalPages
                      ? "pointer-events-none border-gray-200 text-gray-300"
                      : "border-gray-300 text-gray-700 hover:border-[#ff9900] hover:text-[#ff9900]"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

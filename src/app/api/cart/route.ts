import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const addItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99).default(1),
});

async function getOrCreateCart(userId?: string, sessionId?: string) {
  if (!userId && !sessionId) {
    throw new Error("Utilisateur ou session requis");
  }

  const where = userId ? { userId } : { sessionId };

  let cart = await db.cart.findFirst({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              stockQuantity: true,
              images: { select: { url: true, altText: true }, take: 1 },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: {
        userId: userId ?? null,
        sessionId: sessionId ?? null,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stockQuantity: true,
                images: { select: { url: true, altText: true }, take: 1 },
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  return cart;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id");

    if (!user && !sessionId) {
      return NextResponse.json({ cart: null, items: [], total: 0 });
    }

    const cart = await getOrCreateCart(
      user?.id ?? undefined,
      sessionId ?? undefined
    );

    const total = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    return NextResponse.json({
      cart,
      total: Math.round(total * 100) / 100,
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = addItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Donnees invalides",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { productId, quantity } = parsed.data;
    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id");

    if (!user && !sessionId) {
      return NextResponse.json(
        { error: "Authentification ou session requise" },
        { status: 401 }
      );
    }

    const product = await db.product.findUnique({ where: { id: productId } });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Produit non trouve ou indisponible" },
        { status: 404 }
      );
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 409 }
      );
    }

    const cart = await getOrCreateCart(
      user?.id ?? undefined,
      sessionId ?? undefined
    );

    const existingItem = await db.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stockQuantity) {
        return NextResponse.json(
          { error: "Stock insuffisant pour cette quantite" },
          { status: 409 }
        );
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, unitPrice: product.price },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                stockQuantity: true,
                images: { select: { url: true, altText: true }, take: 1 },
              },
            },
          },
          orderBy: { id: "asc" },
        },
      },
    });

    const total = updatedCart!.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    return NextResponse.json({
      cart: updatedCart,
      total: Math.round(total * 100) / 100,
      itemCount: updatedCart!.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

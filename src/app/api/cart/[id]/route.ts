import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const updateItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;
    const body = await request.json();
    const parsed = updateItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { quantity } = parsed.data;

    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, product: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Élément du panier non trouvé" },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id");

    const isOwner =
      (user && cartItem.cart.userId === user.id) ||
      (sessionId && cartItem.cart.sessionId === sessionId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    if (quantity > cartItem.product.stockQuantity) {
      return NextResponse.json(
        { error: "Stock insuffisant" },
        { status: 409 }
      );
    }

    await db.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, unitPrice: cartItem.product.price },
    });

    const updatedCart = await db.cart.findUnique({
      where: { id: cartItem.cartId },
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
      itemCount: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'élément du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: cartItemId } = await params;

    const cartItem = await db.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "Élément du panier non trouvé" },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id");

    const isOwner =
      (user && cartItem.cart.userId === user.id) ||
      (sessionId && cartItem.cart.sessionId === sessionId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    await db.cartItem.delete({ where: { id: cartItemId } });

    const updatedCart = await db.cart.findUnique({
      where: { id: cartItem.cartId },
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
      itemCount: updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'élément du panier:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const checkoutSchema = z.object({
  cartId: z.string().uuid(),
  shippingName: z.string().min(1, "Nom requis"),
  shippingAddress: z.string().min(1, "Adresse requise"),
  shippingCity: z.string().min(1, "Ville requise"),
  shippingZip: z.string().min(1, "Code postal requis"),
  shippingCountry: z.string().min(2, "Pays requis"),
  shippingMethod: z.enum(["standard", "express", "priority"]).default("standard"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      cartId,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingZip,
      shippingCountry,
      shippingMethod,
    } = parsed.data;

    const user = await getCurrentUser();
    const sessionId = request.headers.get("x-session-id");

    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Panier non trouvé" },
        { status: 404 }
      );
    }

    const isOwner =
      (user && cart.userId === user.id) ||
      (sessionId && cart.sessionId === sessionId);

    if (!isOwner) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }

    for (const item of cart.items) {
      if (!item.product.isActive) {
        return NextResponse.json(
          { error: `Le produit "${item.product.name}" n'est plus disponible` },
          { status: 400 }
        );
      }
      if (item.product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour "${item.product.name}" (disponible: ${item.product.stockQuantity})` },
          { status: 400 }
        );
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const shippingCost =
      shippingMethod === "express" ? 14.99 : shippingMethod === "priority" ? 12.99 : 5.99;

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user?.id ?? null,
          totalAmount: Math.round((totalAmount + shippingCost) * 100) / 100,
          status: "PENDING",
          shippingMethod,
          shippingName,
          shippingAddress,
          shippingCity,
          shippingZip,
          shippingCountry,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        });
      }

      await tx.cart.update({
        where: { id: cartId },
        data: { status: "COMPLETED" },
      });

      return newOrder;
    });

    return NextResponse.json({
      order,
      message: "Commande créée avec succès",
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

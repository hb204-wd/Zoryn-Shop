import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const trackEventSchema = z.object({
  eventName: z.string().min(1).max(100),
  userId: z.string().uuid().optional(),
  anonymousId: z.string().optional(),
  sessionId: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const querySchema = z.object({
  event: z.string().optional(),
  days: z.coerce.number().int().min(1).max(365).default(30),
  userId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = trackEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { eventName, userId, anonymousId, sessionId, properties } = parsed.data;

    const event = await db.analyticsEvent.create({
      data: {
        eventName,
        userId: userId ?? null,
        anonymousId: anonymousId ?? null,
        sessionId: sessionId ?? null,
        propertiesJson: properties ? JSON.stringify(properties) : null,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement de l'evenement:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parametres invalides", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { event, days, userId } = parsed.data;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where: Record<string, unknown> = {
      occurredAt: { gte: since },
    };

    if (event) where.eventName = event;
    if (userId) where.userId = userId;

    const eventCounts = await db.analyticsEvent.groupBy({
      by: ["eventName"],
      where,
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const totalEvents = eventCounts.reduce((sum, e) => sum + e._count.id, 0);

    const recentEvents = await db.analyticsEvent.findMany({
      where,
      orderBy: { occurredAt: "desc" },
      take: 100,
      select: {
        id: true,
        eventName: true,
        userId: true,
        anonymousId: true,
        sessionId: true,
        propertiesJson: true,
        occurredAt: true,
      },
    });

    const uniqueUsers = await db.analyticsEvent.groupBy({
      by: ["userId"],
      where: { ...where, userId: { not: null } },
    });

    const uniqueSessions = await db.analyticsEvent.groupBy({
      by: ["sessionId"],
      where: { ...where, sessionId: { not: null } },
    });

    return NextResponse.json({
      summary: {
        totalEvents,
        uniqueUsers: uniqueUsers.length,
        uniqueSessions: uniqueSessions.length,
        periodDays: days,
      },
      eventCounts: eventCounts.map((e) => ({
        event: e.eventName,
        count: e._count.id,
      })),
      recentEvents,
    });
  } catch (error) {
    console.error("Erreur lors de la recuperation des analyses:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

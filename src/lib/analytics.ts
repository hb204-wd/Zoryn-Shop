import { PostHog } from "posthog-node";
import { db } from "./db";

const posthog = process.env.POSTHOG_API_KEY
  ? new PostHog(process.env.POSTHOG_API_KEY, {
      host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
    })
  : null;

interface TrackEventOptions {
  userId?: string;
  sessionId?: string;
  anonymousId?: string;
  metadata?: Record<string, unknown>;
}

async function trackEvent(
  eventName: string,
  options: TrackEventOptions = {}
): Promise<void> {
  const { userId, sessionId, anonymousId, metadata } = options;

  try {
    await db.analyticsEvent.create({
      data: {
        eventName,
        userId: userId ?? null,
        sessionId: sessionId ?? null,
        anonymousId: anonymousId ?? null,
        propertiesJson: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error(`Echec de l'enregistrement de l'evenement "${eventName}":`, error);
  }

  if (posthog) {
    try {
      const distinctId = userId ?? sessionId ?? "anonymous";
      posthog.capture({
        distinctId,
        event: eventName,
        properties: {
          ...metadata,
        },
      });
    } catch (error) {
      console.error(`Echec de l'envoi de l'evenement PostHog "${eventName}":`, error);
    }
  }
}

export async function trackProductView(
  productId: string,
  options: { userId?: string; sessionId?: string } = {}
): Promise<void> {
  await trackEvent("product_viewed", {
    ...options,
    metadata: { productId },
  });
}

export async function trackAddToCart(
  productId: string,
  quantity: number,
  options: { userId?: string; sessionId?: string } = {}
): Promise<void> {
  await trackEvent("product_added_to_cart", {
    ...options,
    metadata: { productId, quantity },
  });
}

export async function trackCheckoutStarted(
  options: { userId?: string; sessionId?: string } = {}
): Promise<void> {
  await trackEvent("checkout_started", options);
}

export async function trackPurchase(
  orderId: string,
  amount: number,
  options: { userId?: string; sessionId?: string } = {}
): Promise<void> {
  await trackEvent("purchase_completed", {
    ...options,
    metadata: { orderId, amount },
  });
}

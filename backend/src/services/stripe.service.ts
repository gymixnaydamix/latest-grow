import Stripe from 'stripe';
import { config } from '../config/index.js';
import { BadRequestError } from '../utils/errors.js';

interface CreateCheckoutArgs {
  invoiceId: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

class StripeService {
  private stripeClient: Stripe | null = null;

  private get client(): Stripe {
    if (!config.stripeSecretKey) {
      throw new BadRequestError('Stripe is not configured: missing STRIPE_SECRET_KEY');
    }
    if (!this.stripeClient) {
      this.stripeClient = new Stripe(config.stripeSecretKey, {
        apiVersion: '2025-08-27.basil',
      });
    }
    return this.stripeClient;
  }

  createCheckoutSession(args: CreateCheckoutArgs) {
    if (!args.amount || args.amount <= 0) {
      throw new BadRequestError('Amount must be a positive number');
    }
    if (!args.currency || args.currency.trim().length === 0) {
      throw new BadRequestError('Currency is required');
    }

    const successUrl = args.successUrl ?? config.stripeSuccessUrl;
    const cancelUrl = args.cancelUrl ?? config.stripeCancelUrl;

    if (!successUrl || !cancelUrl) {
      throw new BadRequestError('Stripe checkout URLs are not configured');
    }

    return this.client.checkout.sessions.create({
      mode: 'payment',
      customer_email: args.customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: args.currency.toLowerCase(),
            product_data: {
              name: `School Invoice ${args.invoiceId}`,
            },
            unit_amount: toMinorUnits(args.amount),
          },
        },
      ],
      metadata: {
        invoiceId: args.invoiceId,
        ...(args.metadata ?? {}),
      },
    });
  }

  constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event {
    if (!config.stripeWebhookSecret) {
      throw new BadRequestError('Stripe webhook is not configured: missing STRIPE_WEBHOOK_SECRET');
    }
    return this.client.webhooks.constructEvent(payload, signature, config.stripeWebhookSecret);
  }
}

export const stripeService = new StripeService();

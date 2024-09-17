import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { CartService } from 'src/cart/cart.service';
import { ResponseService } from 'src/response.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  // COMPARE .ENV DETAILS WITH PARTNER

  constructor(
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });
  }

  async checkOut(userId: string) {
    const cart = await this.cartService.findOne(userId);

    const BASE_URL = this.configService.get<string>('BASE_URL');

    const lineItems = cart.products.map((product) => ({
      price_data: {
        currency: 'ngn',
        product_data: {
          name: product.product.title,
          description: product.product.description,
        },
        unit_amount: product.product.price * 100,
      },
      quantity: product.quantity,
    }));

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${BASE_URL}/success`,
        cancel_url: `${BASE_URL}/cancel`,
      });

      return new ResponseService(
        HttpStatus.CREATED,
        'Payment session created successfully',
        { sessionId: session.id, paymentURL: session.url },
      );
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create payment session',
        error.message,
      );
    }
  }

  async handleWebhook(req: RawBodyRequest<Request>, res: Response) {
    const signature = req.headers['stripe-signature'];
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      return res.sendStatus(400).send(`Webhook Error: ${error.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        const paymentStatus = await this.verifyStatus(session.id);

        if (paymentStatus.getStatus() === 200)
          // Handle successful payment event.

          break;
      case 'payment_intent.payment_failed':
        // const charge = event.data.object;

        break;
      default:
        console.log('Unhandled event type: ', event.type);
        break;
    }

    return res.sendStatus(200);
  }

  async verifyStatus(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found.`);
      }

      switch (session.payment_status) {
        case 'paid':
          return new ResponseService(HttpStatus.OK, 'Payment successful');

        case 'unpaid':
          return new ResponseService(
            HttpStatus.PAYMENT_REQUIRED,
            'Payment is required',
          );

        default:
          return new ResponseService(HttpStatus.BAD_REQUEST, 'Payment failed');
      }
    } catch (error) {
      return new ResponseService(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred during payment verification',
        error,
      );
    }
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: cart.total * 100,
      currency: 'ngn',
      payment_method_types: ['card'],
    });

    return new ResponseService(
      HttpStatus.CREATED,
      'Intent created successfully ',
      { clientSecret: paymentIntent.client_secret },
    );
  }
}

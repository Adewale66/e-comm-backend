import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { CartService } from 'src/cart/cart.service';
import { ResponseService } from 'src/response.service';
import { User } from 'src/users/entities/user.entity';
import Stripe from 'stripe';
import { CustomerUtil } from './utils/customer-util';
import { OrderUtil } from './utils/order-utils';
import { PaymentRequiredException } from '../exceptions/PaymentRequired';

@Injectable()
export class PaymentService {
  private readonly stripe: Stripe;

  constructor(
    private readonly cartService: CartService,
    private readonly configService: ConfigService,
    private readonly customerUtil: CustomerUtil,
    private readonly orderUtil: OrderUtil,
    @InjectQueue('payment made') private paymentQueue: Queue,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });
  }

  async checkOut(user: User) {
    const cart = await this.cartService.find(user.id);

    if (!cart) throw new NotFoundException('Cart not found');

    if (!cart.products.length)
      throw new BadRequestException(
        'Cart is empty. Add items to cart to checkout',
      );

    const BASE_URL = this.configService.get<string>('BASE_URL');
    const customer = await this.customerUtil.getOrCreateCustomer(
      this.stripe,
      user,
    );
    const order = await this.orderUtil.generateOrder(user, cart);

    const lineItems = cart.products.map((product) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.product.title,
        },
        unit_amount: product.product.price * 100,
      },
      quantity: product.quantity,
    }));
    try {
      const session = await this.stripe.checkout.sessions.create({
        line_items: lineItems,
        customer: customer.id,
        metadata: {
          order_id: order.id,
          user_id: user.id,
        },
        mode: 'payment',
        success_url: `${BASE_URL}/payments?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/cart`,
        payment_intent_data: {
          metadata: {
            order_id: order.id,
            user_id: user.id,
          },
        },
      });
      return new ResponseService(
        HttpStatus.CREATED,
        'Payment session created successfully',
        { payment_url: session.url },
      );
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Internal server error, please try again later',
      );
    }
  }

  async handleWebhook(req: RawBodyRequest<Request>) {
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
      Logger.log(error);
      throw new UnauthorizedException();
    }

    await this.paymentQueue.add(
      'payment',
      { event },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );
  }

  async verifyStatus(sessionId: string) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      if (!session) {
        throw new NotFoundException(`Session with ID ${sessionId} not found.`);
      }

      if (session.payment_status === 'unpaid')
        throw new PaymentRequiredException();
      return new ResponseService(HttpStatus.OK, 'Success');
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException(
        'Internal server error, please try again later',
      );
    }
  }

  async getOrders(user: User) {
    return await this.orderUtil.findAll(user.id);
  }
}

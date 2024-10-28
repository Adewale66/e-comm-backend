import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bullmq';
import * as nodemailer from 'nodemailer';
import Stripe from 'stripe';
import { PaymentService } from './payment.service';
import { OrderUtil } from './utils/order-utils';

type CustomerData = {
  name: string;
  email: string;
  orderTable: string;
};

@Processor('payment made')
export class PaymentConsumer extends WorkerHost {
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentService: PaymentService,
    private readonly orderUtil: OrderUtil,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'payment':
        await this.handlePayments(job);
        break;

      default:
        break;
    }
  }

  private async handlePayments(job: Job<any, any, string>) {
    const event = job.data.event as Stripe.Event;

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;

        if (session.payment_status === 'paid') {
          const metaData = session.metadata;

          const orderId = metaData.order_id;
          const user = metaData.user_id;
          await this.orderUtil.setOrderStatus(orderId, 'PAID');

          const orderTable = await this.orderUtil.generateOrderTable(orderId);

          const customerData: CustomerData = {
            name: session.customer_details.name.split(' ')[0],
            email: session.customer_details.email,
            orderTable,
          };

          await this.orderUtil.clearCart(user);
          await this.sendEmail(customerData);
        }

        break;

      case 'payment_intent.payment_failed':
        const paymentFailed = event.data.object;
        const failedOrderId = paymentFailed.metadata.order_id;
        await this.orderUtil.setOrderStatus(failedOrderId, 'FAILED');

        break;
      default:
        Logger.log('Unhandled event type: ', event.type);
        break;
    }
  }

  private async sendEmail(customerData: CustomerData) {
    const email = this.configService.get('EMAIL_USER');

    const { email: customerEmail, name, orderTable } = customerData;

    try {
      const transporter = nodemailer.createTransport({
        host: this.configService.get('EMAIL_HOST'),
        port: +this.configService.get('EMAIL_PORT'),
        auth: {
          user: email,
          pass: this.configService.get('EMAIL_PASS'),
        },
      });

      const emailContent = `
          <p>Hi ${name},</p>
          <p>
            Your order with e-commerce website was processed successfully.
            Your order will be shipped out within 3 business days and we will keep you updated.
            </p>
            <p>Thank you for shopping with us, we appreciate your patronage.</p>

            ${orderTable}
          <div style="display: flex; justify-content: center; align-items: center; width: 40%; margin: 20px auto; 
          background-color: rgba(144,213,255, 0.2); border-radius: 10px;">
          </div>`;

      const info = await transporter.sendMail({
        from: `"E-Commerce" ${email}`,
        to: `${customerEmail}`,
        subject: 'Order Successful',
        html: emailContent,
      });

      Logger.log(`Email sent to ${customerEmail} with id ${info.messageId}`);
    } catch (error) {
      Logger.log('Failed to send email.', error);
    }
  }
}

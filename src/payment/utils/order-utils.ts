import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../entities/order.entity';

export class OrderUtil {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  private async generateOrderNumber() {
    const lastOrder = await this.orderRepository.findOne({
      where: {},
      order: { order_number: 'DESC' },
    });

    if (!lastOrder) {
      return 'ORD000001';
    }
    const oldCount = lastOrder.order_number.replace('ORD', '');

    const newCount = parseInt(oldCount) + 1;

    const orderNumber = newCount.toString().padStart(6, '0');

    return `ORD${orderNumber}`;
  }

  async generateOrder(user: User, cart: Cart) {
    const order = new Order();

    order.id = uuidv4();
    order.order_number = await this.generateOrderNumber();
    order.status = 'PENDING';
    order.user = user;
    order.products = cart.products;

    await this.orderRepository.save(order);

    return order;
  }

  async findOne(orderId: string) {
    return await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['products', 'products.product'],
    });
  }

  async findAll(userId: string) {
    return await this.orderRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['products', 'products.product'],
    });
  }

  async setOrderStatus(orderId: string, status: string) {
    try {
      const order = await this.findOne(orderId);

      if (!order) throw new NotFoundException('Order not found');

      order.status = status;

      await this.orderRepository.save(order);

      return order;
    } catch (error) {
      throw new InternalServerErrorException(
        'Something went wrong',
        error.message,
      );
    }
  }

  generateOrderTable(order: Order) {
    const orderTotal = order.products.reduce(
      (sum, product) => sum + product.quantity * product.product.price,
      0,
    );

    const tableBody = order.products
      .map(
        (product) =>
          ` <tr>
                <td style="border: 1px solid black; padding: 10px;">${product.product.id}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.title}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.quantity}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.price}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.price * product.quantity}</td>
          </tr>`,
      )
      .join('');

    const table = `
    <h2>Order Summary for ${order.order_number} </h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
        <thead>
            <tr>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Product Id</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Product</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Quantity</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Price</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Total</th>
            </tr>
        </thead>
        <tbody>
            ${tableBody}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" style="text-align:right; border: 1px solid black; padding: 10px;"><strong>Grand Total</strong></td>
                <td style="border: 1px solid black; padding: 10px;"><strong>${orderTotal}</strong></td>
            </tr>
        </tfoot>
    </table>
    `;

    return table;
  }
}

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from 'src/cart/entities/cart.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../entities/order.entity';
import { CartService } from '../../cart/cart.service';

@Injectable()
export class OrderUtil {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly cartService: CartService,
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

  async findAll(userId: string) {
    const orders = await this.orderRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['products', 'products.product'],
    });
    const sort = orders.map((order) => {
      return {
        order_number: order.order_number,
        status: order.status,
        order_status: order.order_status,
        created_at: order.created_at,
        products: order.products.map((product) => {
          return {
            productId: product.product.id,
            name: product.product.title,
            price: product.product.price,
            quantity: product.quantity,
            image: product.product.image,
            subtotal: product.product.price * product.quantity,
          };
        }),
        total: order.products.reduce(
          (sum, product) => sum + product.quantity * product.product.price,
          0,
        ),
      };
    });
    sort.sort((a, b) => {
      return b.created_at.getTime() - a.created_at.getTime();
    });
    return sort;
  }

  async clearCart(userId: string) {
    await this.cartService.emptyCart(userId);
  }

  async setOrderStatus(orderId: string, status: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: {
          id: orderId,
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      order.status = status;
      if (status == 'PAID') order.order_status = 'IN TRANSIT';

      await this.orderRepository.save(order);
    } catch (error) {
      Logger.log(error);
      throw new InternalServerErrorException('An error occurred');
    }
  }

  formatCurrency(value: number) {
    const formatted = value.toFixed(2);

    return parseFloat(formatted).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async generateOrderTable(orderId) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
      relations: ['products', 'products.product'],
    });

    if (!order) throw new NotFoundException('Order not found');

    const orderTotal = order.products.reduce(
      (sum, product) => sum + product.quantity * product.product.price,
      0,
    );

    const grandTotal = this.formatCurrency(orderTotal);

    const tableBody = order.products
      .map((product, index) => {
        return ` <tr style="text-align: center;">
                <td style="border: 1px solid black; padding: 10px;">${index + 1}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.title}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.quantity}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.price}</td>
                <td style="border: 1px solid black; padding: 10px;">${product.product.price * product.quantity}</td>
          </tr>`;
      })
      .join('');

    const table = `
    <h2>Order Summary for ${order.order_number} </h2>
    <table style="width: 100%; border-collapse: collapse; margin-top: 5px;">
        <thead>
            <tr>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">#</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Product</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Quantity</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Price($)</th>
                <th style="border: 1px solid black; padding: 10px; background-color: #f2f2f2;">Total($)</th>
            </tr>
        </thead>
        <tbody>
            ${tableBody}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" style="text-align:right; border: 1px solid black; padding: 10px;"><strong>Grand Total</strong></td>
                <td style="border: 1px solid black; padding: 10px;"><strong>$${grandTotal}</strong></td>
            </tr>
        </tfoot>
    </table>
    `;

    return table;
  }
}

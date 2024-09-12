import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
  ) {}

  findOne(userId: string) {
    return this.cartRepository.findOneBy({ userId });
  }

  async addToCart(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);

    cart.products.push(productId);

    await this.cartRepository.save(cart);

    return {
      message: 'Added to cart',
    };
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.cartRepository.findOneBy({ userId });

    if (!cart) {
      throw new NotFoundException('Cart is empty.');
    }

    const productIndex = cart.products.indexOf(productId);

    if (productIndex === -1) {
      if (cart.products.length === 0) {
        await this.cartRepository.delete(userId);
      }

      throw new NotFoundException('Product not found in the cart');
    }

    cart.products.splice(productIndex, 1);

    await this.cartRepository.save(cart);

    return {
      message: 'Product removed from cart',
    };
  }

  async emptyCart(userId: string) {
    const cart = await this.cartRepository.findOneBy({ userId });

    if (!cart) {
      throw new NotFoundException('Cart is already empty.');
    }

    await this.cartRepository.delete(userId);

    return {
      message: 'Cart has been cleared',
    };
  }

  private async getOrCreateCart(userId: string) {
    let cart = await this.cartRepository.findOneBy({ userId });

    if (!cart) {
      cart = new Cart();

      cart.userId = userId;

      cart.products = [];

      await this.cartRepository.save(cart);
    }
    return cart;
  }
}

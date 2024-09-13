import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    private readonly productService: ProductsService,
  ) {}

  async findOne(userId: string) {
    return await this.getOrCreateCart(userId);
  }

  async addToCart(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productService.findOne(productId);

    if (!product) throw new NotFoundException('Product not found');
    cart.products.push(product);

    await this.cartRepository.save(cart);

    return {
      message: 'Added to cart',
    };
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: {
        products: true,
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart is empty.');
    }

    if (!cart.products.some((product) => product.id == productId)) {
      throw new NotFoundException('Product not found');
    }

    cart.products = cart.products.filter((product) => product.id !== productId);

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

    cart.products = [];
    await this.cartRepository.save(cart);

    return {
      message: 'Cart has been cleared',
    };
  }

  private async getOrCreateCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: {
        products: true,
      },
    });

    if (!cart) {
      cart = new Cart();

      cart.userId = userId;

      cart.products = [];

      await this.cartRepository.save(cart);
    }
    return cart;
  }
}

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CartPayloadDto } from './dto/cartpayload.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { ResponseService } from 'src/response.service';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    private readonly productService: ProductsService,
  ) {}

  async findOne(userId: string) {
    return await this.getOrCreateCart(userId);
  }

  async addToCart(userId: string, cartpayload: CartPayloadDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productService.findOne(cartpayload.productId);

    if (!product) throw new NotFoundException('Product not found');

    const updatedCart = this.handleCartUpdate(cart, cartpayload, product);

    await this.cartRepository.save(updatedCart);

    const newCartData = await this.getOrCreateCart(userId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: id, updated_at, ...data } = newCartData;

    return new ResponseService(HttpStatus.CREATED, 'Added to cart', data);
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getOrCreateCart(userId);

    if (!cart) {
      throw new NotFoundException('Cart is empty.');
    }

    const productExists = cart.products.some(
      (product) => product.product.id === productId,
    );

    if (!productExists) {
      throw new NotFoundException('Product not found');
    }

    await this.cartRepository.manager.transaction(async (manager) => {
      const cartProduct = cart.products.find(
        (product) => product.product.id === productId,
      );

      await manager.remove(CartItem, cartProduct);

      cart.products = cart.products.filter(
        (product) => product.product.id !== productId,
      );

      cart.total = this.computeTotalPrice(cart);

      await manager.save(Cart, cart);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId: id, updated_at, ...data } = cart;

    return new ResponseService(
      HttpStatus.OK,
      'Product removed from cart',
      data,
    );
  }

  async emptyCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    if (!cart) {
      throw new NotFoundException('Cart is already empty.');
    }

    await this.cartRepository.manager.transaction(async (manager) => {
      await manager.delete(CartItem, { cart: { userId } });

      cart.total = 0;

      cart.products = [];

      await manager.save(Cart, cart);
    });

    return {
      message: 'Cart has been cleared',
    };
  }

  private async getOrCreateCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: ['products', 'products.product'],
    });

    if (!cart) {
      cart = new Cart();

      cart.userId = userId;

      cart.products = [];

      cart.total = 0.0;

      await this.cartRepository.save(cart);
    }
    return cart;
  }

  private handleCartUpdate(
    cart: Cart,
    cartpayload: CartPayloadDto,
    product: Product,
  ) {
    const productInCart = cart.products.find(
      (item) => item.product.id === cartpayload.productId,
    );

    if (productInCart) {
      productInCart.quantity = cartpayload.quantity;
    } else {
      const cartItem = new CartItem();

      cartItem.cart = cart;
      cartItem.quantity = cartpayload.quantity;
      cartItem.product = product;

      cart.products.push(cartItem);
    }

    cart.total = this.computeTotalPrice(cart);

    return cart;
  }

  private computeTotalPrice(cart: Cart) {
    const newCartTotal = cart.products.reduce(
      (sum, product) => sum + product.quantity * product.product.price,
      0,
    );

    return parseFloat(newCartTotal.toFixed(2));
  }
}

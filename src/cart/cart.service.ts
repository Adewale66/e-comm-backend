import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products/products.service';
import { CartPayloadDto } from './dto/cartpayload.dto';
import { CartItem } from './entities/cart-item.entity';
import { Cart } from './entities/cart.entity';
import { ResponseService } from 'src/response.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    private readonly productService: ProductsService,
  ) {}

  async findOne(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const cartItems = cart.products.map((item) => {
      const { product, quantity } = item;
      return {
        productId: product.id,
        image: product.image,
        name: product.title,
        price: product.price,
        quantity,
      };
    });

    const data = {
      products: cartItems,
    };

    return new ResponseService(HttpStatus.OK, 'Cart retrieved', data);
  }

  async find(userId) {
    return await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: ['products', 'products.product'],
    });
  }

  async addToCart(userId: string, cartPayload: CartPayloadDto) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.productService.findById(cartPayload.productId);

    if (!product) throw new NotFoundException('Product not found');

    const containsProduct = cart.products.some(
      (product) => product.product.id === cartPayload.productId,
    );
    if (containsProduct) {
      throw new BadRequestException('Product already in cart');
    }

    const cartItem = new CartItem();

    cartItem.cart = cart;
    cartItem.quantity = 1;
    cartItem.product = product;
    cart.products.push(cartItem);
    cart.total = this.computeTotalPrice(cart);

    await this.cartRepository.save(cart);

    return new ResponseService(HttpStatus.CREATED, 'Added to cart');
  }

  async updateQuantity(userId: string, quanity: number, productId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: ['products', 'products.product'],
    });
    if (!cart) throw new NotFoundException('Cart not found');

    const product = await this.productService.findById(productId);

    if (!product) throw new NotFoundException('Product not found');

    const productInCart = cart.products.find(
      (item) => item.product.id === productId,
    );

    if (!productInCart)
      throw new NotFoundException('Product not found in cart');

    if (quanity === 0) {
      return this.removeFromCart(userId, productId);
    }

    productInCart.quantity = quanity;

    cart.total = this.computeTotalPrice(cart);

    await this.cartRepository.save(cart);

    return new ResponseService(HttpStatus.OK, `Item quanity updated`);
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: ['products', 'products.product'],
    });

    if (!cart) {
      throw new NotFoundException('Cart is empty.');
    }

    const productExists = cart.products.some(
      (product) => product.product.id === productId,
    );

    if (!productExists) {
      throw new NotFoundException('Product not found');
    }

    const filteredProducts = cart.products.filter(
      (product) => product.product.id !== productId,
    );

    cart.products = filteredProducts;
    cart.total = this.computeTotalPrice(cart);
    await this.cartRepository.save(cart);
  }

  async emptyCart(userId: string) {
    const cart = await this.cartRepository.findOne({
      where: {
        userId,
      },
      relations: ['products'],
    });

    if (cart.products.length === 0) {
      throw new NotFoundException('Cart is already empty.');
    }

    cart.products = [];
    cart.total = 0;
    await this.cartRepository.save(cart);
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

      await this.cartRepository.save(cart);
    }
    return cart;
  }

  private computeTotalPrice(cart: Cart) {
    const cartTotal = cart.products.reduce(
      (sum, product) => sum + product.quantity * product.product.price,
      0,
    );

    const fixedDecimalTotal = parseFloat(cartTotal.toFixed(2));

    return Math.round(fixedDecimalTotal);
  }
}

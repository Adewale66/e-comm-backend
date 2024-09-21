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
import { CartResponse, ResponseService } from 'src/response.service';
import { BulkDto } from './dto/bulk.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepository: Repository<Cart>,
    private readonly productService: ProductsService,
  ) {}

  async findCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const cartItems = cart.products.map((item) => {
      const { product, quantity } = item;
      return {
        productId: product.id,
        image: product.image,
        name: product.title,
        price: product.price,
        quantity,
        subtotal: quantity * product.price,
      };
    });
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    return new CartResponse('Cart retrieved', total, cartItems);
  }

  async addBulk(userId: string, bulkDto: BulkDto) {
    const cart = await this.getOrCreateCart(userId);

    for (const product of bulkDto.products) {
      const cartItem = cart.products.find(
        (cartItem) => cartItem.product.id === product.productId,
      );

      if (cartItem) {
        cartItem.quantity += product.quantity;
      } else {
        const newCartItem = new CartItem();
        newCartItem.cart = cart;

        const productItem = await this.productService.findById(
          product.productId,
        );
        if (!productItem) throw new NotFoundException('Product Not Found');

        newCartItem.product = productItem;
        newCartItem.quantity = product.quantity;

        cart.products.push(newCartItem);
      }
    }

    cart.total = this.computeTotalPrice(cart);
    await this.cartRepository.save(cart);
    return new ResponseService(HttpStatus.CREATED, 'Products added to cart');
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

    const containsProduct = cart.products.find(
      (product) => product.product.id === cartPayload.productId,
    );
    if (containsProduct) {
      return this.updateQuantity(
        userId,
        cartPayload.quantity + containsProduct.quantity,
        cartPayload.productId,
      );
    }

    const cartItem = new CartItem();

    cartItem.cart = cart;
    cartItem.quantity = cartPayload.quantity;
    cartItem.product = product;
    cart.products.push(cartItem);
    cart.total = this.computeTotalPrice(cart);

    await this.cartRepository.save(cart);

    return new ResponseService(HttpStatus.CREATED, 'Product added to cart');
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
      throw new BadRequestException('Cart is already empty.');
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

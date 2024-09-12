import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CartService } from './cart.service';
import { UserData } from 'src/decorators';

type CartPayload = {
  productId: string;
};

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findOne(@UserData() user: User) {
    return this.cartService.findOne(user.id);
  }

  @Post('add')
  addToCart(@UserData() user: User, @Body() payload: CartPayload) {
    return this.cartService.addToCart(user.id, payload.productId);
  }

  @Delete('remove')
  removeFromCart(@UserData() user: User, @Body() payload: CartPayload) {
    return this.cartService.removeFromCart(user.id, payload.productId);
  }

  @Delete('clear')
  emptyCart(@UserData() user: User) {
    return this.cartService.emptyCart(user.id);
  }
}

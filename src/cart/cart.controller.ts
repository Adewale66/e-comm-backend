import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UserData } from 'src/users/user.decorator';
import { CartService } from './cart.service';
import { Public } from 'src/decorators';

type CartPayload = {
  productId: string;
};

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @Public()
  findOne(@UserData() user: User) {
    return this.cartService.findOne(user.id);
  }

  @Post('add')
  @Public()
  addToCart(@UserData() user: User, @Body() payload: CartPayload) {
    return this.cartService.addToCart(user.id, payload.productId);
  }

  @Delete('remove')
  @Public()
  removeFromCart(@UserData() user: User, @Body() payload: CartPayload) {
    return this.cartService.removeFromCart(user.id, payload.productId);
  }

  @Delete('clear')
  @Public()
  emptyCart(@UserData() user: User) {
    return this.cartService.emptyCart(user.id);
  }
}

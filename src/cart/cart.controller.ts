import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CartService } from './cart.service';
import { UserData } from 'src/decorators';
import { CartPayloadDto } from './dto/cartpayload.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findOne(@UserData() user: User) {
    return this.cartService.findOne(user.id);
  }

  @Post('add')
  addToCart(@UserData() user: User, @Body() cartPayload: CartPayloadDto) {
    return this.cartService.addToCart(user.id, cartPayload);
  }

  @Patch('subtract')
  reduceItemQuantity(
    @UserData() user: User,
    @Body() cartPayload: CartPayloadDto,
  ) {
    return this.cartService.reduceItemQuantity(user.id, cartPayload);
  }

  @Delete('remove')
  removeFromCart(@UserData() user: User, @Body() payload: CartPayloadDto) {
    return this.cartService.removeFromCart(user.id, payload.productId);
  }

  @Delete('clear')
  emptyCart(@UserData() user: User) {
    return this.cartService.emptyCart(user.id);
  }
}

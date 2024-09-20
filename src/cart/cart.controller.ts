import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CartService } from './cart.service';
import { UserData } from 'src/decorators';
import { CartPayloadDto } from './dto/cartpayload.dto';
import { QuantityPayloadDto } from './dto/quantityPayload.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findOne(@UserData() user: User) {
    return this.cartService.findOne(user.id);
  }

  @Post('items')
  addToCart(@UserData() user: User, @Body() cartPayload: CartPayloadDto) {
    return this.cartService.addToCart(user.id, cartPayload);
  }

  @Patch('items/:id')
  updateQuantity(
    @UserData() user: User,
    @Param('id') productId: string,
    @Body() cartPayload: QuantityPayloadDto,
  ) {
    return this.cartService.updateQuantity(
      user.id,
      cartPayload.quantity,
      productId,
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('items/:id')
  removeFromCart(@UserData() user: User, @Param('id') productId: string) {
    return this.cartService.removeFromCart(user.id, productId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('items')
  emptyCart(@UserData() user: User) {
    return this.cartService.emptyCart(user.id);
  }
}

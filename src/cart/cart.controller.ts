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
  Put,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { CartService } from './cart.service';
import { UserData } from 'src/decorators';
import { CartPayloadDto } from './dto/cartpayload.dto';
import { QuantityPayloadDto } from './dto/quantityPayload.dto';
import { BulkDto } from './dto/bulk.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findOne(@UserData() user: User) {
    return this.cartService.findCart(user.id);
  }

  @Post('items')
  addToCart(@UserData() user: User, @Body() cartPayload: CartPayloadDto) {
    return this.cartService.addToCart(user.id, cartPayload);
  }

  @Patch('items')
  addBulk(@UserData() user: User, @Body() bulkDto: BulkDto) {
    return this.cartService.addBulk(user.id, bulkDto);
  }

  @Put('items/:id')
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
  @Delete()
  emptyCart(@UserData() user: User) {
    return this.cartService.emptyCart(user.id);
  }
}

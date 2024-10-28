import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Public, UserData } from 'src/decorators';
import { User } from 'src/users/entities/user.entity';
import { PaymentService } from './payment.service';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('payment')
@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('payment/stripe/checkout')
  checkOut(@UserData() user: User) {
    try {
      return this.paymentService.checkOut(user);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('payment/webhook')
  handleWebhook(@Req() req: RawBodyRequest<Request>) {
    return this.paymentService.handleWebhook(req);
  }

  @Get('payment/stripe/status')
  verifyStatus(@Query('session_id') sessionId: string) {
    return this.paymentService.verifyStatus(sessionId);
  }

  @Get('orders')
  getOrders(@UserData() user: User) {
    return this.paymentService.getOrders(user);
  }
}

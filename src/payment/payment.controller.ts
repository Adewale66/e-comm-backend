import {
  Controller,
  Get,
  Post,
  Query,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Public, UserData } from 'src/decorators';
import { User } from 'src/users/entities/user.entity';
import { PaymentService } from './payment.service';
import { Request, Response } from 'express';

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
  @Post('webhook')
  handleWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    return this.paymentService.handleWebhook(req, res);
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

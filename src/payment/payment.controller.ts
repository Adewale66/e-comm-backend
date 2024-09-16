import { Controller, Post } from '@nestjs/common';
import { UserData } from 'src/decorators';
import { User } from 'src/users/entities/user.entity';
import { PaymentService } from './payment.service';

@Controller('stripe')
export class PaymentController {
  constructor(private readonly stripeService: PaymentService) {}

  @Post('checkout')
  checkOut(@UserData() user: User) {
    try {
      return this.stripeService.checkOut(user.id);
    } catch (error) {
      throw new Error(error);
    }
  }
}

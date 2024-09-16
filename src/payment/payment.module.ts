import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [CartModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

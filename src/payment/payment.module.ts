import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { CartModule } from 'src/cart/cart.module';
import { CustomerUtil } from './utils/customer-util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { BullModule } from '@nestjs/bullmq';
import { PaymentConsumer } from './consumer';
import { OrderUtil } from './utils/order-utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    CartModule,
    BullModule.registerQueue({
      name: 'payment made',
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, CustomerUtil, OrderUtil, PaymentConsumer],
})
export class PaymentModule {}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { BullModule } from '@nestjs/bullmq';
import { ResetConsumer } from './consumer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
    UsersModule,
    BullModule.registerQueue({
      name: 'reset email',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        global: true,
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ResetConsumer,
  ],
})
export class AuthModule {}

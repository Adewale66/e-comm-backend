import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/password.dto';
import { generate } from 'otp-generator';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    @InjectQueue('reset email') private resetQueue: Queue,
  ) {}

  // user sends reset request -> send shortlived otp to email -> verify otp -> allow user to change password
  // verify email exists
  async resetPassword(resetPassword: ResetPasswordDto) {
    const code = generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 1);
    const otp = new Otp();
    otp.code = code;
    otp.expiresIn = expiration;
    await this.otpRepository.save(otp);

    await this.resetQueue.add(
      'reset',
      {
        email: resetPassword.email,
        code,
      },
      {
        attempts: 3,
        removeOnComplete: true,
      },
    );
    return {
      message: 'email sent',
    };
  }

  async register(registerDto: RegisterDto) {
    const userExists = await this.usersService.findOne(registerDto.email);

    if (userExists) {
      throw new UnprocessableEntityException('User already exists');
    }

    return await this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findOne(loginDto.email);
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    const verifiedPassword = await argon2.verify(
      user.password,
      loginDto.password,
    );

    if (!verifiedPassword) {
      throw new BadRequestException('Invalid Password');
    }
    const payload = {
      email: user.email,
      id: user.id,
    };

    return {
      access_tokne: await this.jwtService.signAsync(payload),
    };
  }
}

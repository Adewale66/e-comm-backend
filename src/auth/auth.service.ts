import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Queue } from 'bullmq';
import { generate } from 'otp-generator';
import { ResponseService } from 'src/response.service';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/password.dto';
import { Otp } from './entities/otp.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService,
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    @InjectQueue('reset email') private resetQueue: Queue,
  ) {}

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

    const data = {
      access_token: await this.jwtService.signAsync(payload),
    };

    return this.responseService.success('Login successful', data);
  }

  // user sends reset request -> send shortlived otp to email -> verify otp -> allow user to change password
  // verify email exists
  async resetPassword(resetPassword: ResetPasswordDto) {
    const userExists = await this.usersService.findOne(resetPassword.email);

    if (!userExists)
      throw new NotFoundException('No account found with this email');

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

    return this.responseService.success('Email sent');
  }

  async verifyOtp(otp: string) {
    const isValidOtp = await this.otpRepository.findOneBy({ code: otp });

    if (!isValidOtp) throw new UnauthorizedException('Invalid OTP code');

    return this.responseService.success('Otp verification successful');
  }

  newPassword(updateInfo: LoginDto) {
    return this.usersService.newPassword(updateInfo);
  }

  changePassword(passwords: ChangePasswordDto) {
    return this.usersService.changePassword(passwords);
  }
}

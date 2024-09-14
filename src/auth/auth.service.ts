import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  HttpStatus,
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
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    return new ResponseService(HttpStatus.OK, 'Login successful', data);
  }

  async resetPassword(resetPassword: ResetPasswordDto) {
    const userExists = await this.usersService.findOne(resetPassword.email);

    if (!userExists)
      throw new NotFoundException('No account found with this email');

    const code = generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 2);
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
    return new ResponseService(HttpStatus.OK, 'Email sent');
  }

  async verifyOtp(otp: string) {
    const isValidOtp = await this.otpRepository.findOneBy({ code: otp });

    if (!isValidOtp) throw new UnauthorizedException('Invalid OTP code');

    const date = new Date();

    if (isValidOtp.expiresIn < date) {
      throw new BadRequestException('Invalid OTP code');
    }

    return new ResponseService(HttpStatus.OK, 'Otp verification successful');
  }

  newPassword(updateInfo: LoginDto) {
    return this.usersService.newPassword(updateInfo);
  }

  changePassword(passwords: ChangePasswordDto, user: User) {
    return this.usersService.changePassword(passwords, user);
  }
}

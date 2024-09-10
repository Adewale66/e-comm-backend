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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    return {
      access_tokne: await this.jwtService.signAsync(payload),
    };
  }
}

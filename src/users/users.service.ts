import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { LoginDto } from 'src/auth/dto/login.dto';
import { ResponseService } from 'src/response.service';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/create-auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly responseService: ResponseService,
  ) {}
  async create(registerDto: RegisterDto) {
    const user = new User();
    user.email = registerDto.email;
    user.password = await argon2.hash(registerDto.password);
    user.firstName = registerDto.firstName;
    user.lastName = registerDto.lastName;
    await this.userRepository.save(user);

    return {
      message: 'User created successfully',
    };
  }

  async newPassword(updateInfo: LoginDto) {
    const user = await this.findOne(updateInfo.email);

    if (!user)
      throw new NotFoundException(`${updateInfo.email} is not a valid user`);

    return await this.updatePassword(user, updateInfo.password);
  }

  async changePassword(passwords: ChangePasswordDto) {
    const user = await this.findOne(passwords.email);

    if (!user)
      throw new NotFoundException(`${passwords.email} is not a valid user`);

    const verifiedPassword = await argon2.verify(
      user.password,
      passwords.currentPassword,
    );

    if (!verifiedPassword)
      throw new BadRequestException('Current password is incorrect');

    return await this.updatePassword(user, passwords.newPassword);
  }

  async findOne(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  private async updatePassword(user: User, password: string) {
    user.password = await argon2.hash(password);

    await this.userRepository.save(user);

    return this.responseService.success('Password changed successfully');
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/create-auth.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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

  async findOne(email: string) {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }
}

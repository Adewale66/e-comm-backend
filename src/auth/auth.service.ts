import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  create(registerDto: RegisterDto) {
    return `Hello ${registerDto.firstName}`;
  }
}

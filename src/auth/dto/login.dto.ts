import { RegisterDto } from './create-auth.dto';
import { OmitType } from '@nestjs/swagger';

export class LoginDto extends OmitType(RegisterDto, [
  'firstName',
  'lastName',
]) {}

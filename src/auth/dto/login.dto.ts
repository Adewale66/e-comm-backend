import { OmitType } from '@nestjs/mapped-types';
import { RegisterDto } from './create-auth.dto';

export class LoginDto extends OmitType(RegisterDto, [
  'firstName',
  'lastName',
]) {}

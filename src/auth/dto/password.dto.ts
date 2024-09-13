import { OmitType } from '@nestjs/mapped-types';
import { LoginDto } from './login.dto';

export class ResetPasswordDto extends OmitType(LoginDto, ['password']) {}

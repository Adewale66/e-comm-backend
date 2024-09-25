import { LoginDto } from './login.dto';
import { OmitType } from '@nestjs/swagger';

export class ResetPasswordDto extends OmitType(LoginDto, ['password']) {}

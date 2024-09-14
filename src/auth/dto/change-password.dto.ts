import { IsNotEmpty, IsString } from 'class-validator';
import { ResetPasswordDto } from './password.dto';

export class ChangePasswordDto extends ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

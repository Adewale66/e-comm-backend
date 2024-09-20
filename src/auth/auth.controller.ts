import { Body, Controller, Patch, Post } from '@nestjs/common';
import { Public, UserData } from '../decorators';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/password.dto';
import { Otp } from './entities/otp.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgot-password')
  resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.authService.resetPassword(resetPassword);
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() otp: Pick<Otp, 'code'>) {
    return this.authService.verifyOtp(otp.code);
  }

  @Public()
  @Patch('reset-password')
  newPassword(@Body() updateInfo: LoginDto) {
    return this.authService.newPassword(updateInfo);
  }

  @Patch('change-password')
  changePassword(@Body() passwords: ChangePasswordDto, @UserData() user: User) {
    return this.authService.changePassword(passwords, user);
  }
}

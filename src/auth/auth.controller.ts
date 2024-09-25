import { Body, Controller, Patch, Post } from '@nestjs/common';
import { Public, UserData } from '../decorators';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/password.dto';
import { Otp } from './entities/otp.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../users/entities/user.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'User registered successfully' })
  @ApiUnprocessableEntityResponse({ description: 'User already exists' })
  @Public()
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiBadRequestResponse({ description: 'User does not exist' })
  @ApiOkResponse({ description: 'User logged in successfully' })
  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiCreatedResponse({ description: 'OTP created' })
  @Public()
  @Post('forgot-password')
  resetPassword(@Body() resetPassword: ResetPasswordDto) {
    return this.authService.resetPassword(resetPassword);
  }

  @ApiBadRequestResponse({ description: 'Invalid OTP' })
  @ApiOkResponse({ description: 'OTP verified' })
  @ApiUnauthorizedResponse({ description: 'OTP expired' })
  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() otp: Pick<Otp, 'code'>) {
    return this.authService.verifyOtp(otp.code);
  }

  @ApiBadRequestResponse({ description: 'Current password is incorrect' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiOkResponse({ description: 'Password changed successfully' })
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

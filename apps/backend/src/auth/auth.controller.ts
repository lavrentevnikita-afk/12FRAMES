import { Body, Controller, Get, Headers, Post } from '@nestjs/common'
import { AuthService, AuthResponseDto, AuthUserDto } from './auth.service'

class LoginDto {
  email: string
  password: string
}

class RegisterDto {
  email: string
  password: string
  name?: string
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name } = body
    return this.authService.register(email, password, name)
  }

  @Post('login')
  login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = body
    return this.authService.login(email, password)
  }

  private extractToken(authHeader?: string): string {
    if (!authHeader) return ''
    const [type, token] = authHeader.split(' ')
    if (type.toLowerCase() === 'bearer' && token) return token
    return ''
  }

  @Get('me')
  me(@Headers('authorization') authHeader?: string): Promise<AuthUserDto> {
    const token = this.extractToken(authHeader)
    return this.authService.getProfileByToken(token)
  }

  // алиас под фронт, который спрашивает /auth/profile
  @Get('profile')
  profile(@Headers('authorization') authHeader?: string): Promise<AuthUserDto> {
    const token = this.extractToken(authHeader)
    return this.authService.getProfileByToken(token)
  }
}

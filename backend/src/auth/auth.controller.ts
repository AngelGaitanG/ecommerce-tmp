import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { CustomResponse } from 'src/core/custom-response';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {

constructor(
    private readonly authService: AuthService
){}

@Post('login')
async login(@Body() loginDto: LoginDto){
    try {
        const data = await this.authService.login(loginDto)
        return CustomResponse.success('Usuario iniciado sesión exitosamente', data)
    } catch (error) {
        return CustomResponse.error(error)
    }
}

@Post('register')
async register(@Body() registerDto: RegisterDto){
    try {
        const data = await this.authService.register(registerDto)
        return CustomResponse.success('Usuario registrado exitosamente', data)
    } catch (error) {
        return CustomResponse.error(error)
    }
}

}

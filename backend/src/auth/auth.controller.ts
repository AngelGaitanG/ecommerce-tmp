import { Body, Controller, Post, Get } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { CustomResponse } from 'src/core/custom-response';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './users/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './users/dto/user-response.dto';

@Controller('auth')
export class AuthController {

constructor(
    private readonly authService: AuthService
){}

@Public()
@Post('login')
async login(@Body() loginDto: LoginDto){
    try {
        const data = await this.authService.login(loginDto)
        return CustomResponse.success('Usuario iniciado sesión exitosamente', data)
    } catch (error) {
        return CustomResponse.error(error)
    }
}

@Public()
@Post('register')
async register(@Body() registerDto: RegisterDto){
    try {
        const data = await this.authService.register(registerDto)
        return CustomResponse.success('Usuario registrado exitosamente', data)
    } catch (error) {
        return CustomResponse.error(error)
    }
}

@Get('me')
async getProfile(@GetUser() user: User){
    try {
        const userDto = plainToInstance(UserResponseDto, user, {
            excludeExtraneousValues: true,
        });
        return CustomResponse.success('Información del usuario obtenida exitosamente', userDto)
    } catch (error) {
        return CustomResponse.error(error)
    }
}

}

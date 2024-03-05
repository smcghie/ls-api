import { Body, Controller, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { UpdateAvatarDto, UpdateEmailDto, UpdatePasswordDto, UpdateUsernameDto } from './dto/update-user.dto';

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService){}

    @Post('/signup')
    signUp(@Body() signUpDto: SignUpDto, @Res() response: Response) {
        return this.authService.signUp(signUpDto, response)
    }

    @Post('/login')
    async login(@Body() loginDto: LoginDto, @Res() response: Response) {
        await this.authService.login(loginDto, response);
    }

    @Post('/logout')
    logout(@Res() response: Response) {
        this.authService.logout(response);
        response.sendStatus(200);
    }

    @UseGuards(AuthGuard())
    @Patch('updatePassword')
    async updatePassword(
        @Body() updatePasswordDto: UpdatePasswordDto,
        @Req() req,
    ) {
        //console.log("updatePasswordDTO: ", updatePasswordDto)
        return this.authService.updatePassword(updatePasswordDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateAvatar')
    async updateAvatar(
        @Body() updateAvatarDto: UpdateAvatarDto,
        @Req() req,
    ) {
        //console.log("updateAvatarDto", updateAvatarDto)
        return this.authService.updateAvatar(updateAvatarDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateUsername')
    async updateUsername(
        @Body() updateUsernameDto: UpdateUsernameDto,
        @Req() req,
    ) {
        return this.authService.updateUsername(updateUsernameDto, req.user);
    }

    @UseGuards(AuthGuard())
    @Patch('updateEmail')
    async updateEmail(
        @Body() updateEmailDto: UpdateEmailDto,
        @Req() req,
    ) {
        return this.authService.updateEmail(updateEmailDto, req.user);
    }
}
import { Res, BadRequestException, Injectable, NotFoundException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as mongoose from 'mongoose';
import { Response } from 'express';
import { getPresignedAvatarUrl } from 'src/utils/signage';
import { UpdateAvatarDto, UpdateEmailDto, UpdatePasswordDto, UpdateUsernameDto } from './dto/update-user.dto';
import { Album } from 'src/albums/schemas/album.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        @InjectModel(Album.name) private albumModel: Model<Album>
    ) {}

    async signUp(signUpDto: SignUpDto, @Res() response: Response): Promise<any> {
        const { avatar, username, name, email, password, albumCount} = signUpDto

        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                message: 'A user is already registered with that email'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await this.userModel.create({
            avatar,
            username,
            name,
            email,
            password: hashedPassword,
            albumCount
        })

        const token = this.jwtService.sign(
            { id: user._id },
            { expiresIn: '1d' }
        )

        response.cookie('token', token, {
            httpOnly: true,
            secure: false, 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        const presignedUrl = await getPresignedAvatarUrl(user.avatar);

        const userResponse = {
            _id: user._id,
            avatar: presignedUrl,
            username: user.username,
            name: user.name,
            albumCount: user.albumCount
        };

        response.json({ user: userResponse });
    }

    async login(loginDto: LoginDto, @Res() response: Response): Promise<void> {
        const { email, password } = loginDto;

        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
            throw new UnauthorizedException('Invalid password');
        }

        const token = this.jwtService.sign(
            { id: user._id },
            { expiresIn: '1d' }
        )

        response.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            path: '/',
        });

        const presignedUrl = await getPresignedAvatarUrl(user.avatar);

        const userResponse = {
            _id: user._id,
            avatar: presignedUrl,
            username: user.username,
            name: user.name,
            friends: user.friends,
            albumCount: user.albumCount
        };

        response.json({ user: userResponse });
        //console.log("RESPONSE: ", response)
        return this.userModel.findByIdAndUpdate(user._id, { 
            previousLogin: user.lastLogin,
            lastLogin: new Date() 
        });
    }

    logout(response: Response) {
        response.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0), 
            secure: false, 
            path: '/',
    });

    //console.log("LOGGING OUT")

    }

    async updatePassword(updatePasswordDto: UpdatePasswordDto, user: User): Promise<any> {
        const { oldPassword, newPassword } = updatePasswordDto;
        console.log("USER: ", user)
        if (!user) {
            throw new Error('User not found');
        }

        const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatching) {
            throw new Error('Old password does not match');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.userModel.findByIdAndUpdate(user._id, { password: hashedPassword });

        return { message: 'Password updated successfully' };
    }

    async updateAvatar(updateAvatarDto: UpdateAvatarDto, user: User): Promise<any> {
        const { avatarUrl } = updateAvatarDto;
        const updatedUser = await this.userModel.findByIdAndUpdate(
            user._id, 
            { avatar: avatarUrl },
            { new: true } 
        );

        await this.albumModel.updateMany(
            { "createdBy": user._id }, 
            { $set: { "moments.$[].user.avatar": avatarUrl } }
        ); 

        const presignedUrl = await getPresignedAvatarUrl(updatedUser.avatar);

        const userResponse = {
            _id: user._id,
            avatar: presignedUrl,
            username: user.username,
            name: user.name,
            friends: user.friends,
            albumCount: user.albumCount
        };

        return { 
            message: 'Avatar updated successfully',
            user: userResponse 
        };
    }

    async updateUsername(updateUsernameDto: UpdateUsernameDto, user: User): Promise<any> {
        const { newUsername } = updateUsernameDto;
        const updatedUser = await this.userModel.findByIdAndUpdate(
            user._id, 
            { username: newUsername },
            { new: true } 
            );

        await this.albumModel.updateMany(
            { "createdBy": user._id }, 
            { $set: { "moments.$[].user.username": newUsername } }
        ); 

        return { 
            message: 'Username updated successfully',
            user: updatedUser
        };
    }

    async updateEmail(updateEmailDto: UpdateEmailDto, user: User): Promise<any> {
        const { newEmail } = updateEmailDto;
        await this.userModel.findByIdAndUpdate(user._id, { email: newEmail });
        return { message: 'Email updated successfully' };
    }
}
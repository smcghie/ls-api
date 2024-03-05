import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './schemas/user.schema';

@Controller('users')

export class UserController {
    constructor(private userService: UserService) {}

    @Post('/search')
    @UseGuards(AuthGuard())
    async search(@Body('query') query: string, @Req() req,) {
        return await this.userService.search(query, req.user);
    }

    @Put('/add-friend')
    async addFriend(@Body() body: { userId: string, friendId: string }) {
        return this.userService.addFriend(body.userId, body.friendId);
    }

    @Put('/remove-friend')
    async removeFriend(@Body() body: { userId: string, friendId: string }) {
        return this.userService.removeFriend(body.userId, body.friendId);
    }

    @Get(':id/friends')
    async getFriends(
        @Param('id') userId: string
    ): Promise<User[]> {
        return this.userService.findFriendsByUserId(userId);
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async getMoment(
        @Param('id')
        id: string
    ): Promise<User> {
        //console.log("id: ", id)
        return this.userService.findById(id)
    }
}
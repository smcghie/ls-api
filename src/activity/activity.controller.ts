import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('activities')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) {}

    @Get()
    @UseGuards(AuthGuard())
    getRecentFriendActivities(@Req() req) {
        console.log("GETTING ACTIVITY CONTROLLER: ", req.user)
        return this.activityService.getRecentFriendActivities(req.user);
    }
}
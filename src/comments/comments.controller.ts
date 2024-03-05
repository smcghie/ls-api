import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {

    constructor(private commentService: CommentsService) {}

    @Post()
    @UseGuards(AuthGuard())
    async createComment(
        @Body() createCommentDto: CreateCommentDto,
        @Req() req
    ): Promise<Comment> {
        //console.log(req.user);
        return this.commentService.create(createCommentDto, req.user);
    }

    @Get(':id')
    @UseGuards(AuthGuard())
    async getMoment(
        @Param('id')
        id: string
    ): Promise<Comment[]> {
        return this.commentService.findByMomentId(id)
    }

    @Delete(':id')
    async deleteComment(
        @Param('id')
        id: string,
        @Query('albumId')
        albumId: string
    ): Promise<Comment> {
        //console.log(`Comment ID: ${id}`);
        //console.log(`Album ID: ${albumId}`);
        return this.commentService.deleteById(id, albumId)
    }
}
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { AuthGuard } from '@nestjs/passport';
import { Album } from './schemas/album.schema';
import { CreateMomentsDto } from './dto/create-moment-dto';

@Controller('albums')
export class AlbumsController {
    constructor(private albumsService: AlbumsService) {}

    @Post()
    @UseGuards(AuthGuard())
    async createAlbum(
      @Body() albumData: Album,
      @Req() req,
    ): Promise<Album> {
      //console.log("ALBUM DATA: ", albumData)
      return this.albumsService.createAlbum(albumData, req.user);
    }

    @Post(':albumId/moments')
    @UseGuards(AuthGuard())
    async createMoments(
        @Body()
        moments: CreateMomentsDto,
        @Param('albumId')
        albumId: string,
        @Req() req,
    ): Promise<Album> {
        return this.albumsService.addMomentsToAlbum(moments, albumId, req.user);
    }    

    @Get('/user/:userId')
    @UseGuards(AuthGuard())
    async getMoment(
        @Param('userId')
        userId: string
    ): Promise<Album[]> {
      console.log("ID: ", userId)
        return this.albumsService.findAllByUser(userId)
    }

    @Delete('/moment/:momentId')
    @UseGuards(AuthGuard())
    async deleteMoment(
        @Param('momentId')
        momentId: string,
        @Query('albumId')
        albumId: string
    ): Promise<Album> {
        return this.albumsService.deleteMomentById(momentId, albumId)
    }
}
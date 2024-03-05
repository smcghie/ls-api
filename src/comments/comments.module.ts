import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from './schemas/comment.schema';
import { AlbumSchema } from 'src/albums/schemas/album.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema },
      { name: 'Album', schema: AlbumSchema }
    ])
  ],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}

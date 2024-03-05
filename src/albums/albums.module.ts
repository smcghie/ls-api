import { Module } from '@nestjs/common';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AuthModule } from 'src/auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AlbumSchema } from './schemas/album.schema';
import { UserSchema } from 'src/user/schemas/user.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: "Album", schema: AlbumSchema},
      { name: 'User', schema: UserSchema }
  ])
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService]
})
export class AlbumsModule {}

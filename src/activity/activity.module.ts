import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { AlbumSchema } from 'src/albums/schemas/album.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'Album', schema: AlbumSchema }
    ]),
  ],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule {}

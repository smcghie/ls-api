import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { getPresignedAvatarUrl, getPresignedFullUrl, getPresignedThumbUrl } from 'src/utils/signage';
import { Album } from 'src/albums/schemas/album.schema';

@Injectable()
export class ActivityService {
    constructor(
        @InjectModel(Album.name) private albumModel: Model<Album>,
    ) {}

    async getRecentFriendActivities(user: User): Promise<Album[]> {
    
        let albums: Album[] = [];
        let limit = 10;
        let firedCount = 0;

        while (limit > 0) {
            firedCount += 1;
            //console.log("FIRED")
            const newAlbums = await this.albumModel.find({
                'createdBy': { $in: user.friends },
            })
            .limit(limit)
            .populate('moments')
            .lean()
            .sort({ createdAt: -1 });
            
            if (newAlbums.length === 0) {
                break;
            }

            let duplicateCount = 0;
            newAlbums.forEach((newAlbum) => {
            if (!albums.some((moment) => moment.createdBy === newAlbum.createdBy)) {
                albums.push(newAlbum);
                duplicateCount++;
            } 
            });
            console.log("newAlbums: ", newAlbums)
            if(duplicateCount > 0){
                break;
            }
            limit -= newAlbums.length;
        }

        const albumsWithPresignedUrls = await Promise.all(albums.map(async (album) => {
            const updatedMoments = await Promise.all(album.moments.map(async (moment) => {
                const { _id, username, name, avatar } = moment.user;
        
                let presignedAvatarUrl = '';
                try {
                    presignedAvatarUrl = await getPresignedAvatarUrl(avatar);
                } catch (error) {
                    console.error('Error generating presigned avatar URL:', error);
                }
        
                let presignedThumbUrl = '';
                let presignedFullUrl = '';
                if (moment.image) {
                    try {
                        presignedThumbUrl = await getPresignedThumbUrl(moment.image);
                        presignedFullUrl = await getPresignedFullUrl(moment.image);
                    } catch (error) {
                        console.error('Error generating presigned image URL:', error);
                    }
                }
        
                return {
                    ...moment,
                    image: presignedThumbUrl,
                    fullImage: presignedFullUrl,
                    user: { _id, username, name, avatar: presignedAvatarUrl }
                };
            }));
        
            return {
                ...album,
                moments: updatedMoments
            };
        }));
        console.log("MOMENTS DATA: ", albumsWithPresignedUrls)
        return albumsWithPresignedUrls;
    }
}
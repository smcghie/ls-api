import { Injectable, NotFoundException } from '@nestjs/common';
import { Album, Moment } from './schemas/album.schema';
import { User } from 'src/user/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { getPresignedAvatarUrl, getPresignedFullUrl, getPresignedThumbUrl } from 'src/utils/signage';
import { CreateMomentsDto } from './dto/create-moment-dto';

interface MomentWithFullImage extends Moment {
    fullImage?: string;
}

interface AlbumWithFullImage extends Album {
    moments: MomentWithFullImage[];
}

@Injectable()
export class AlbumsService {

    constructor(
        @InjectModel(Album.name)
        private albumModel: mongoose.Model<Album>,
        @InjectModel(User.name)
        private userModel: mongoose.Model<User>
    ) {}

    async createAlbum(albumData: Album, user: User): Promise<Album> {
        const createdBy = user._id;
        const userData = {
            _id: user._id,
            avatar: user.avatar,
            username: user.username,
            name: user.name
        };
        const data = Object.assign({}, albumData, { createdBy }, { user: userData });
        try {
            const createdAlbum = await this.albumModel.create({...data, moments: []});
            try {
                if (albumData.moments && albumData.moments.length > 0) {
                    const updatedMoments = albumData.moments.map(moment => ({
                        ...moment,
                        user: {
                            _id: user._id,
                            avatar: user.avatar,
                            username: user.username,
                            name: user.name
                        },
                        albumId: createdAlbum._id,
                        commentCount: 0
                    }));
    
                    createdAlbum.moments = updatedMoments;
                    await createdAlbum.save();
                }
            } catch (updateError) {
                console.error("Failed to update moments:", updateError);
            }
            try{
                await this.userModel.updateOne(
                    { _id: user._id },
                    { $inc: { albumCount: 1 } }
                );
            } catch(error){
                console.error("Failed to increment user moment count:", error);
            }

            return createdAlbum;
        } catch (createError) {
            console.error("Failed to create album:", createError);
            throw createError; 
        }
    }

    async addMomentsToAlbum(createMomentDtos: CreateMomentsDto, albumId: string, user: User): Promise<Album> {
        const album = await this.albumModel.findById(albumId);

        if (!album) {
            throw new NotFoundException(`Album with ID ${albumId} not found`);
        }
    
        const userData = {
            _id: user._id,
            avatar: user.avatar,
            username: user.username,
            name: user.name
        };
    
        const momentCreationPromises = createMomentDtos.moments.map(async (createMomentDto) => {
            const newMoment = new Moment();
            newMoment.image = createMomentDto.image;
            newMoment.description = createMomentDto.description;
            newMoment.coordinates = createMomentDto.coordinates;
            newMoment.commentCount = 0;
            newMoment.captureDate = createMomentDto.captureDate;
            newMoment.user = userData;
            newMoment.albumId = album._id;
    
            album.moments.push(newMoment);
        });
    
        await Promise.all(momentCreationPromises);
        await album.save();
    
        const albumObj = album.toObject() as AlbumWithFullImage;
    
        if (albumObj.moments) {
            albumObj.moments = await Promise.all(
                albumObj.moments.map(async (moment) => {
                    const updatedMoment = { ...moment };
                    
                    if (moment.image) {
                        updatedMoment.image = await getPresignedThumbUrl(moment.image);
                        updatedMoment.fullImage = await getPresignedFullUrl(moment.image);
                    }
    
                    if (moment.user && moment.user.avatar) {
                        updatedMoment.user.avatar = await getPresignedAvatarUrl(moment.user.avatar);
                    }
    
                    return updatedMoment;
                })
            );
        }
    
        return albumObj;
    }
    
    async findAllByUser(userId: string): Promise<AlbumWithFullImage[]> {
        let albums = await this.albumModel.find({ createdBy: userId });
        //console.log("ALBUMS: ", albums)
        if (!albums || albums.length === 0) {
            throw new NotFoundException('No albums found for the given userId');
        }
    
        const albumsWithUpdatedMoments: AlbumWithFullImage[] = await Promise.all(
            albums.map(async (album) => {
                const albumObj = album.toObject() as AlbumWithFullImage;
    
                if (albumObj.moments) {
                    albumObj.moments = await Promise.all(

                        albumObj.moments.map(async (moment) => {
                            const updatedMoment = { ...moment };
                            
                            if (moment.image) {
                                updatedMoment.image = await getPresignedThumbUrl(moment.image);
                                updatedMoment.fullImage = await getPresignedFullUrl(moment.image);
                            }
    
                            if (moment.user && moment.user.avatar) {
                                updatedMoment.user.avatar = await getPresignedAvatarUrl(moment.user.avatar);
                            }
    
                            return updatedMoment;
                        })
                    );
                }
                return albumObj;
            })
        );
        return albumsWithUpdatedMoments;
    }

    async deleteById(albumId: string, user: User): Promise<any> {
        try {
            const result = await this.albumModel.findByIdAndDelete(albumId);
            if (!result) {
                throw new Error('Album not found');
            }
    
            try {
                await this.userModel.updateOne(
                    { _id: user._id },
                    { $inc: { albumCount: -1 } }
                );
            } catch (updateError) {
                console.error("Failed to decrement user album count:", updateError);
            }
        } catch (error) {
            console.error("Failed to delete album:", error);
            throw error;
        }
    }

    async deleteMomentById(momentId: string, albumId: string): Promise<any> {
        try {
            const album = await this.albumModel.findById(albumId).exec();
            if (!album) {
              throw new NotFoundException(`Album with ID ${albumId} not found`);
            }
        
            const filteredMoments = album.moments.filter(moment => moment._id.toString() !== momentId);
        
            if (album.moments.length === filteredMoments.length) {
              throw new NotFoundException(`Moment with ID ${momentId} not found in album with ID ${albumId}`);
            }
        
            album.moments = filteredMoments;
            
            await album.save();

            const albumObj = album.toObject() as AlbumWithFullImage;
    
            if (albumObj.moments) {
                albumObj.moments = await Promise.all(

                    albumObj.moments.map(async (moment) => {
                        const updatedMoment = { ...moment };
                        
                        if (moment.image) {
                            updatedMoment.image = await getPresignedThumbUrl(moment.image);
                            updatedMoment.fullImage = await getPresignedFullUrl(moment.image);
                        }

                        if (moment.user && moment.user.avatar) {
                            updatedMoment.user.avatar = await getPresignedAvatarUrl(moment.user.avatar);
                        }

                        return updatedMoment;
                    })
                );
            }

            return albumObj;

        } catch (error) {
            console.error("Failed to delete moment:", error);
            throw error;
        }
    }
}

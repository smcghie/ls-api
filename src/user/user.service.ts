import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './schemas/user.schema';
import { Types } from 'mongoose';
import { getPresignedAvatarUrl } from 'src/utils/signage';

export interface UserSearchResult {
    _id: string;
    username: string;
    name: string;
    avatar: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: mongoose.Model<User>,
    ) {}
  
    async search(query: string, user: User): Promise<UserSearchResult[]> {
        if (typeof query !== 'string') {
            throw new Error('Query must be a string');
        }
    
        const users = await this.userModel.find({ 
            username: { $regex: query, $options: 'i' },
            _id: { $ne: user._id }
        }).exec();
    
        const friendsWithPresignedUrls = await Promise.all(users.map(async (user) => {

            const { _id, username, name, avatar } = user.toObject();

            let presignedUrl = '';
            if (avatar) {
                try {
                    presignedUrl = await getPresignedAvatarUrl(avatar);
                } catch (error) {
                    console.error('Error generating presigned URL:', error);
                }
            }
            return { _id: user._id, username, name, avatar: presignedUrl }; 
        }));
        console.log("FRIENDS WITH: ", friendsWithPresignedUrls)
        return friendsWithPresignedUrls;
    }
    
    async addFriend(userId: string, friendId: string): Promise<any> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid userId');
            }
    
            if (!Types.ObjectId.isValid(friendId)) {
                throw new Error('Invalid friendId');
            }
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                { $addToSet: { friends: friendId } },
                { new: true }
            ).exec();
            if (!updatedUser) {
                throw new Error('User not found');
            }

            const presignedUrl = await getPresignedAvatarUrl(updatedUser.avatar);

            const userResponse = {
                _id: updatedUser._id,
                avatar: presignedUrl,
                username: updatedUser.username,
                name: updatedUser.name,
                friends: updatedUser.friends,
                albumCount: updatedUser.albumCount
            };
            return {user: userResponse};
        } catch (error) {
            console.error('Error adding friend:', error);
            throw error; 
        }
    }

    async removeFriend(userId: string, friendId: string): Promise<any> {
        try {
            if (!Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid userId');
            }
    
            if (!Types.ObjectId.isValid(friendId)) {
                throw new Error('Invalid friendId');
            }
            const updatedUser = await this.userModel.findByIdAndUpdate(
                userId,
                { $pull: { friends: friendId } },
                { new: true }
            ).exec();
            if (!updatedUser) {
                throw new Error('User not found');
            }

            const presignedUrl = await getPresignedAvatarUrl(updatedUser.avatar);

            const userResponse = {
                _id: updatedUser._id,
                avatar: presignedUrl,
                username: updatedUser.username,
                name: updatedUser.name,
                friends: updatedUser.friends,
                albumCount: updatedUser.albumCount
            };
            return {user: userResponse};
        } catch (error) {
            console.error('Error removing friend:', error);
            throw error; 
        }
    }
    

    async findFriendsByUserId(userId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException('Invalid userId');
        }
    
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
    
        const friendIds = user.friends;
    
        if (!friendIds.length) {
            return []; 
        }
    
        const validFriendIds = friendIds.filter(id => Types.ObjectId.isValid(id));
        const friends = await this.userModel.find({
            '_id': { $in: validFriendIds }
        }).exec();

        const friendsWithPresignedUrls = await Promise.all(friends.map(async (friend) => {
            const { _id, username, name, avatar } = friend.toObject(); 
            const presignedUrl = await getPresignedAvatarUrl(avatar);
            return { _id: _id, username, name, avatar: presignedUrl }; 
        }));
    
        return friendsWithPresignedUrls;
    }

    async findById(id: string): Promise<any> {

        const isValidId = mongoose.isValidObjectId(id)

        if(!isValidId) {
            throw new BadRequestException('Please enter correct id')
        }

        const user = await this.userModel.findById(id);

        if(!user) {
            throw new NotFoundException('User not found')
        }

        const { _id, username, name, avatar, friends, albumCount } = user.toObject();
        const presignedUrl = await getPresignedAvatarUrl(avatar);
        return { _id, username, name, avatar: presignedUrl, friends, albumCount };
    }
}
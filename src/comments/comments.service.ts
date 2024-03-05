import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Comment } from './schemas/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { getPresignedAvatarUrl } from 'src/utils/signage';
import { Album } from 'src/albums/schemas/album.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: mongoose.Model<Comment>,
    @InjectModel(Album.name)
    private albumModel: mongoose.Model<Album>,
  ) {}

  async create(commentData: CreateCommentDto, user: any): Promise<Comment> {
    //console.log('USER: ', user);
    const newComment = new this.commentModel({
      ...commentData,
      user: {
        id: user._id,
        avatar: user.avatar,
        name: user.name,
        username: user.username,
      },
    });
    //console.log('COMMENT DATA: ', commentData);
    try {
      const savedComment = await newComment.save();

      try {
        await this.albumModel.updateOne(
          { 'moments._id': commentData.momentId },
          { $inc: { 'moments.$.commentCount': 1 } },
        );
      } catch (updateError) {
        console.error('Failed to update moment comment count:', updateError);
      }

      return savedComment;
    } catch (createError) {
      console.error('Failed to create comment:', createError);
      throw createError;
    }
  }

  async findByMomentId(momentId: string): Promise<Comment[]> {
    const isValidId = mongoose.isValidObjectId(momentId);

    if (!isValidId) {
      throw new BadRequestException('Please enter a correct id');
    }

    let comments = await this.commentModel.find({ momentId: momentId });

    if (!comments || comments.length === 0) {
      throw new NotFoundException('No comments found for the given momentId');
    }

    comments = await Promise.all(
      comments.map(async (comment) => {
        if (comment.user && comment.user.avatar) {
          comment.user.avatar = await getPresignedAvatarUrl(
            comment.user.avatar,
          );
        }
        return comment;
      }),
    );

    return comments;
  }

  async deleteById(id: string, albumId: string): Promise<any> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new Error('Comment not found');
    }

    const momentId = comment.momentId;

    await this.commentModel.findByIdAndDelete(id);

    return this.albumModel.updateOne(
      {
        _id: albumId,
        'moments._id': momentId,
      },
      {
        $inc: { 'moments.$.commentCount': -1 },
      },
    );
  }
}

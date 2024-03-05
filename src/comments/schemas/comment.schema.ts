import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class UserSubschema {
    @Prop()
    id: string;

    @Prop()
    avatar: string;

    @Prop()
    name: string;

    @Prop()
    username: string;
}

@Schema({ timestamps: true })
export class Comment extends Document {

    @Prop()
    momentId: string;

    @Prop({ type: UserSubschema })
    user: UserSubschema;

    @Prop()
    commentText: string;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] }) 
    replies: Comment[]; 
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
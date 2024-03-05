import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

export enum AlbumType{
    PERSONAL = 'Personal',
    TRIP = 'Trip',
    EVENT = 'Event'
}

interface UserData  {
    _id: string,
    avatar: string,
    username: string,
    name: string,
};

@Schema({
    timestamps: true
})

export class Moment {

    @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
    _id: mongoose.Schema.Types.ObjectId;
    
    @Prop()
    image: string;

    @Prop()
    description: string;

    @Prop()
    coordinates: number[];

    @Prop()
    commentCount: number;

    @Prop()
    captureDate: string;

    @Prop({ 
        type: {
            _id: mongoose.Schema.Types.ObjectId,
            avatar: String,
            username: String,
            name: String
        }
    })
    user: UserData;

    @Prop()
    createdAt?: Date

    @Prop({ type: mongoose.Types.ObjectId, ref: 'Album' })
    albumId: mongoose.Types.ObjectId;
    
}

export const MomentSchema = SchemaFactory.createForClass(Moment);

@Schema({
    timestamps: true
})
export class Album {
    @Prop()
    title: string;

    @Prop()
    albumType: string;

    @Prop({ type: [MomentSchema] })
    moments: Moment[];

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    createdBy: mongoose.Types.ObjectId;
}

export const AlbumSchema = SchemaFactory.createForClass(Album);
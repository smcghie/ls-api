import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({
    timestamps: true
})

export class User extends Document{

    @Prop()
    avatar: string;

    @Prop()
    username: string;

    @Prop()
    name: string;

    @Prop({ unique: [true, 'Duplicate email entered']})
    email: string;

    @Prop()
    password: string;

    @Prop()
    friends: string[];

    @Prop()
    albumCount: number;

    @Prop()
    lastLogin: Date;

    @Prop()
    previousLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
import { ArrayMaxSize, ArrayMinSize, IsArray, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";
import { ValidateNested } from 'class-validator';
import { Type } from "class-transformer";

interface UserData  {
    _id: string,
    avatar: string,
    username: string,
    name: string,
};

export class CreateMomentDto {

    @IsOptional()
    @IsMongoId() 
    readonly _id?: mongoose.Types.ObjectId;

    @IsString()
    readonly image: string;

    @IsString()
    readonly description: string;

    @IsArray()
    @ArrayMinSize(2)
    @ArrayMaxSize(2)
    @IsNumber({}, { each: true })
    readonly coordinates: number[];

    @IsNumber()
    readonly commentCount: number;

    @IsString()
    readonly captureDate: string;

    readonly user: UserData;

    @IsString()
    readonly albumId: mongoose.Types.ObjectId;
}


export class CreateMomentsDto {
    @ValidateNested({ each: true })
    @Type(() => CreateMomentDto)
    moments: CreateMomentDto[];
}
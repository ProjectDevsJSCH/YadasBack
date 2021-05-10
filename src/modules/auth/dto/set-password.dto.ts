import {
    IsString, MinLength, MaxLength,
} from 'class-validator';

export class SetPassowrdDto {
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string;

    @IsString()
    resetToken: string;
}

import {
    IsString, MinLength, MaxLength,
} from 'class-validator';

export class UpdatePasswordDto {
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    newPassword: string;

    @IsString()
    oldPassword: string;
}

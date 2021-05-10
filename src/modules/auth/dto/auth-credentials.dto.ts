import {
    IsString, MinLength, MaxLength, IsEmail,
} from 'class-validator';

export class AuthCredentialsDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string;
}

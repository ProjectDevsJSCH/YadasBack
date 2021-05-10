import { Optional } from '@nestjs/common';
import {
    IsString, MinLength, MaxLength, IsEmail, IsIn,
} from 'class-validator';
import { Enterprise } from 'src/modules/enterprise/enterprise.entity';
import { Roles } from 'src/modules/roles/roles.entity';

export class AuthSignUpDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    rol: number;

    enterprise: number;

    @IsString()
    @MinLength(2)
    surname: string;

    password: string;
}

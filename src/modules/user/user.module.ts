import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AuthRepository } from '../auth/auth.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserRepository,
            AuthRepository,
        ]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService, TypeOrmModule],
})
export class UserModule { }

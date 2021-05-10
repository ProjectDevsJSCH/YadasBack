import { Module, forwardRef } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthRepository } from './auth.repository';
import { UserRolValidationPipe } from './user-rol-validation.pipe';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { RolesRepository } from '../roles/roles.repository';
import { LoggerModule } from '../logger/logger.module';

const JWT_CONFIG = config.get('jwt') as any;

@Module({
    imports: [
        LoggerModule,
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || JWT_CONFIG.secret,
            signOptions: {
                expiresIn: 60 * 60 * 24 * 7, // One week
            },
        }),
        TypeOrmModule.forFeature([
            AuthRepository,
            EnterpriseRepository,
            RolesRepository,
        ]),
        forwardRef(() => UserModule),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        UserRolValidationPipe,
        PassportModule,
    ],
    exports: [
        JwtStrategy,
        PassportModule,
        UserRolValidationPipe,
        AuthService,
    ],
})
export class AuthModule { }

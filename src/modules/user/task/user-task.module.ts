import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from 'src/modules/logger/logger.module';
import { DataBaseModule } from 'src/database/database.module';
import { AuthRepository } from 'src/modules/auth/auth.repository';
import { EnterpriseRepository } from 'src/modules/enterprise/enterprise.repository';
import { RolesRepository } from 'src/modules/roles/roles.repository';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserRepository } from '../user.repository';
import { UserTaskService } from './user-task.service';
@Module({
    imports: [
        DataBaseModule,
        AuthModule,
        TypeOrmModule.forFeature([
            UserRepository,
            RolesRepository,
            AuthRepository,
            EnterpriseRepository,
        ]),
        LoggerModule,
    ],
    providers: [UserTaskService],
})
export class UserTaskModule { }

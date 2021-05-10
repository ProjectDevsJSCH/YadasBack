import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { LoggerModule } from '../logger/logger.module';
import { RolesRepository } from './roles.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { EnterpriseModule } from '../enterprise/enterprise.module';
import { RolesEnterpriseModule } from '../roles-enterprise/roles-enterprise.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnterpriseRepository,
            RolesRepository,
        ]),
        LoggerModule,
        EnterpriseModule,
        RolesEnterpriseModule,

    ],
    controllers: [RolesController],
    providers: [RolesService],
    exports: [RolesService],
})
export class RolesModule { }

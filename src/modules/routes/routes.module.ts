import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { LoggerModule } from '../logger/logger.module';
import { RolesModule } from '../roles/roles.module';
import { RoutesRepository } from './routes.repository';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnterpriseRepository,
            RoutesRepository,
        ]),
        LoggerModule,
        RolesModule,

    ],
    controllers: [RoutesController],
    providers: [RoutesService],
    exports: [RoutesService],
})
export class RoutesModule { }

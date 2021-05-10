import { CacheModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../logger/logger.module';
import { RolesEnterpriseModule } from '../roles-enterprise/roles-enterprise.module';
import { EnterpriseController } from './enterprise.controller';
import { EnterpriseRepository } from './enterprise.repository';
import { EnterpriseService } from './enterprise.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnterpriseRepository,
        ]),
        LoggerModule,
        CacheModule.register({
            ttl: 3600,
        }),
        RolesEnterpriseModule,
    ],
    controllers: [EnterpriseController],
    providers: [EnterpriseService],
    exports: [EnterpriseService],
})
export class EnterpriseModule { }

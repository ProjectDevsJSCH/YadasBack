import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { RolesRepository } from '../roles/roles.repository';
import { RolesEnterpriseController } from './roles-enterprise.controller';
import { RolesEnterpriseRepository } from './roles-enterprise.repository';
import { RolesEnterpriseService } from './roles-enterprise.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EnterpriseRepository,
            RolesRepository,
            RolesEnterpriseRepository,
        ]),
    ],
    controllers: [RolesEnterpriseController],
    providers: [RolesEnterpriseService],
})
export class RolesEnterpriseModule { }

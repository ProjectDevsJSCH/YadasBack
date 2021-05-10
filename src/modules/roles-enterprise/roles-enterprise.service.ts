import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { RolesRepository } from '../roles/roles.repository';
import { RolesEnterprise } from './roles-enterprise.entity';
import { RolesEnterpriseRepository } from './roles-enterprise.repository';

@Injectable()
export class RolesEnterpriseService extends TypeOrmCrudService<RolesEnterprise> {
    constructor(
        @InjectRepository(EnterpriseRepository)
        private enterpriseRepository: EnterpriseRepository,
        @InjectRepository(RolesRepository)
        private rolesRepository: RolesRepository,
        @InjectRepository(RolesEnterpriseRepository)
        private rolesEnterpriseRepository: RolesEnterpriseRepository,
    ) {
        super(rolesEnterpriseRepository);
        this.rolesEnterpriseRepository.seed(
            this.enterpriseRepository,
            this.rolesRepository,
        );
    }
}

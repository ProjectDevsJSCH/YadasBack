import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { Roles } from './roles.entity';
import { RolesRepository } from './roles.repository';

@Injectable()
export class RolesService extends TypeOrmCrudService<Roles> {
    constructor(
        @InjectRepository(RolesRepository)
        public rolesRepository: RolesRepository,

    ) {
        super(rolesRepository);
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { LoggerService } from '../logger/logger.service';
import { Enterprise } from './enterprise.entity';
import { EnterpriseRepository } from './enterprise.repository';

@Injectable()
export class EnterpriseService extends TypeOrmCrudService<Enterprise> {
    constructor(
        @InjectRepository(Enterprise)
        public enterpriseRepository: EnterpriseRepository,
        private logger: LoggerService,
    ) {
        super(enterpriseRepository);
        this.logger.setContext('RolesService');
    }
}

import { BadGatewayException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { getConnection, Repository } from 'typeorm';
import { Enterprise } from '../enterprise/enterprise.entity';
import { RoutesBulkDto } from './dto/routes-bulk.dto';
import { Roles } from '../roles/roles.entity';
import { Routes } from './routes.entity';
import { RoutesRepository } from './routes.repository';

@Injectable()
export class RoutesService extends TypeOrmCrudService<Routes> {
    constructor(
        @InjectRepository(RoutesRepository)
        public routesRepository: RoutesRepository,
    ) {
        super(routesRepository);
    }

    async bulkRoutes(routes: RoutesBulkDto) {
        const allPaths = (await this.routesRepository.find()).map((route) => route.path);
        const bulkfiltered = routes.bulk.filter((route) => !allPaths.includes(route.path));
        await this.routesRepository.save(bulkfiltered);
        return { message: 'Routes successfully insert' };
    }
}

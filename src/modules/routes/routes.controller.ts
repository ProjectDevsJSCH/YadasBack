import {
    Body, Controller, Header, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    Crud, CrudController, CrudRequest, Override, ParsedRequest,
} from '@nestjsx/crud';
import * as CacheTime from 'src/cache/cache-time';

import { RolesGuard } from 'src/decorators/roles/roles.guard';
import { AuthConstants } from '../auth/auth.constants';
import { Routes } from './routes.entity';
import { RoutesService } from './routes.service';

@Crud({
    model: {
        type: Routes,
    },
    query: {
        join: {
            rolesEnterprise: {
            },
        },

    },
    routes: {
        createManyBase: {

        },
    },
})
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('routes')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('routes')
export class RoutesController implements CrudController<Routes> {
    constructor(public service: RoutesService) { }

    get base(): CrudController<Routes> {
        return this;
    }

    @Override()
    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_WEEK}`)
    getOne(
        @ParsedRequest() req: CrudRequest,
    ) {
        return this.base.getOneBase(req);
    }

    @Override()
    createMany(
        @Body() RoutesBulkDto,
    ) {
        return this.service.bulkRoutes(
            RoutesBulkDto,
        );
    }
}

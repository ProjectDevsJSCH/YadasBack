import { Controller, Header } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    Crud, CrudController, CrudRequest, Override, ParsedRequest,
} from '@nestjsx/crud';
import * as CacheTime from 'src/cache/cache-time';

import { AuthConstants } from '../auth/auth.constants';
import { RolesEnterprise } from './roles-enterprise.entity';
import { RolesEnterpriseService } from './roles-enterprise.service';

@Crud({
    model: {
        type: RolesEnterprise,
    },
    query: {
        join: {
            enterprise: {},
            role: {},
        },
    },
})
@ApiTags('roles-enterprise')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('roles-enterprise')
export class RolesEnterpriseController implements CrudController<RolesEnterprise> {
    constructor(
        public service: RolesEnterpriseService,
    ) {
    }

    get base(): CrudController<RolesEnterprise> {
        return this;
    }

    @Override()
    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_WEEK}`)
    getOne(
        @ParsedRequest() req: CrudRequest,
    ) {
        return this.base.getOneBase(req);
    }
}

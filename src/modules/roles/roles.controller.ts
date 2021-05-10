import { Controller, Header, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    Crud, CrudController, CrudRequest, Override, ParsedRequest,
} from '@nestjsx/crud';
import * as CacheTime from 'src/cache/cache-time';

import { AuthConstants } from '../auth/auth.constants';
import { Roles } from './roles.entity';
import { RolesService } from './roles.service';

@Crud({
    model: {
        type: Roles,
    },
    query: {
        join: {
            enterprise: {},
        },
    },
})
@UseGuards(AuthGuard('jwt'))
@ApiTags('roles')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('roles')
export class RolesController implements CrudController<Roles> {
    constructor(public service: RolesService) {
    }

    get base(): CrudController<Roles> {
        return this;
    }

    @Override()
    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY}`)
    getMany(
      @ParsedRequest() req: CrudRequest,
    ) {
        return this.base.getManyBase(req);
    }
}

import {
    CacheInterceptor, CacheTTL, Controller, Header, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
    Crud, CrudController, CrudRequest, Override, ParsedRequest,
} from '@nestjsx/crud';
import * as CacheTime from 'src/cache/cache-time';

import { AuthConstants } from '../auth/auth.constants';
import { Enterprise } from './enterprise.entity';
import { EnterpriseService } from './enterprise.service';

@UseInterceptors(CacheInterceptor)
@CacheTTL(3600)
@Crud({
    model: {
        type: Enterprise,
    },
})
@UseGuards(AuthGuard('jwt'))
@ApiTags('enterprise')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('enterprise')
export class EnterpriseController implements CrudController<Enterprise> {
    constructor(public service: EnterpriseService) {
    }

    get base(): CrudController<Enterprise> {
        return this;
    }

    @Override()
    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_MONTH}`)
    getOne(
        @ParsedRequest() req: CrudRequest,
    ) {
        return this.base.getOneBase(req);
    }
}

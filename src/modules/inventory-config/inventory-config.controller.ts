import {
    Controller, Get, Header, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Crud, CrudController } from '@nestjsx/crud';
import * as CacheTime from 'src/cache/cache-time';
import { AuthConstants } from '../auth/auth.constants';
import { InventoryConfigDto } from './dto/inventory-config.dto';

import { InventoryConfig } from './inventory-config.entity';
import { InventoryConfigService } from './inventory-config.service';

@Crud({
    model: {
        type: InventoryConfig,
    },
})
@UseGuards(AuthGuard('jwt'))
@ApiTags('InventoryConfig')
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('inventory-config')
export class InventoryConfigController implements CrudController<InventoryConfig> {
    constructor(public service: InventoryConfigService) { }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY}`)
    @Get('config')
    getConfig(): Promise<{ columns: string[]; config: InventoryConfigDto[]; }> {
        return this.service.getSortConfig();
    }
}

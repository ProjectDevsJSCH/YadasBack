import {
    Controller,
    Get,
    Header,
    Param,
    ParseIntPipe,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { RolesGuard } from 'src/decorators/roles/roles.guard';
import { ENTERPRISE } from 'src/constants/enterprise.enum';
import { GenericDataResponse } from 'src/reponse/interfaces/generic-data-response.interface';
import * as CacheTime from 'src/cache/cache-time';
import { InventoryService } from './inventory.service';
import { InventoryGroupDto } from './dto/inventory-group.dto';
import { GetInventoryFilterDto } from './dto/get-inventory-filter.dto';
import { GetUser } from '../user/get-user.decorator';
import { User } from '../user/user.entity';
import { InventoryViewService } from './inventory-view.service';
import { InventoryViewFilterDto } from './dto/inventory-view-filter.dto';
import { AuthConstants } from '../auth/auth.constants';
import { UnipartesExistence } from './dto/unipartes-existence.dto';

@ApiTags('Inventory')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth(AuthConstants.ACCESS_TOKEN_NAME)
@Controller('inventory')
export class InventoryController {
    constructor(
        private inventoryService: InventoryService,
        private inventoryViewService: InventoryViewService,
    ) { }

    @UseGuards(RolesGuard)
    @Get('/:enterprise/all/')
    getAllInventoryYadas(
        @Query() filterDto: GetInventoryFilterDto,
        @Param('enterprise') enterprise: ENTERPRISE,
        @GetUser() user: User,
    ): Promise<InventoryGroupDto[]> {
        return this.inventoryService.getAllInventory(filterDto, user, enterprise);
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_HOUR}`)
    @Get(':id/prices')
    getPricesByProduct(@Param('id', ParseIntPipe) id: number): Promise<any> {
        return this.inventoryService.getPromotionsByProduct(id);
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY}`)
    @Get('promotions')
    getAllPromotions(): Promise<any> {
        return this.inventoryService.getAllPromotions();
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY}`)
    @Get('inventory_view')
    @UsePipes(ValidationPipe)
    getInventoryViewData(
        @Query() inventoryViewFilterDto: InventoryViewFilterDto,
    ) {
        return this.inventoryViewService.getInventoryViewData(inventoryViewFilterDto);
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY}`)
    @Get('inventory_detail')
    @UsePipes(ValidationPipe)
    getInventoryViewDetail(
        @Query('idInventory') idInventory: number,
        @Query() inventoryViewFilterDto: InventoryViewFilterDto,
    ) {
        return this.inventoryViewService.getInventoryViewDetail(
            inventoryViewFilterDto,
            idInventory,
        );
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_HOUR}`)
    @Get('unipartes-stock')
    getUnipartesInventory(): Promise<GenericDataResponse<UnipartesExistence>> {
        return this.inventoryService.getUnipartesStockInventory();
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_WEEK}`)
    @Get('brands')
    getAllBrands() {
        return this.inventoryViewService.getAllBrands();
    }

    @Header('Cache-Control', `private, max-age=${CacheTime.ONE_DAY * 3}`)
    @Get('groups')
    getAllGroups() {
        return this.inventoryViewService.getAllGroups();
    }
}

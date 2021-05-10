import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataBaseModule } from 'src/database/database.module';
import { InventoryViewRepository } from './inventory-view.repository';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryViewService } from './inventory-view.service';
import { DailyInventoryRepository } from './dayli-inventory.repository';

@Module({
    imports: [
        DataBaseModule,
        CacheModule.register(),
        TypeOrmModule.forFeature([
            InventoryViewRepository,
            DailyInventoryRepository,

        ]),
    ],

    controllers: [InventoryController],
    providers: [InventoryService, InventoryViewService],
})
export class InventoryModule { }

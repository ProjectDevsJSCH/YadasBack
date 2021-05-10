import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from 'src/modules/logger/logger.module';
import { InventoryViewTasksService } from 'src/modules/inventory/task/Inventory-view-task.service';
import { DataBaseModule } from 'src/database/database.module';
import { InventoryViewRepository } from '../inventory-view.repository';
import { DailyInventoryRepository } from '../dayli-inventory.repository';

@Module({
    imports: [
        DataBaseModule,
        TypeOrmModule.forFeature([
            InventoryViewRepository,
            DailyInventoryRepository,
        ]),
        LoggerModule,
    ],
    providers: [InventoryViewTasksService],
})
export class InvenotryViewTasksModule { }

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataBaseModule } from 'src/database/database.module';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { InventoryConfig } from '../inventory-config.entity';
import { InventoryConfigTaskService } from './inventory-config-task.service';

@Module({
    imports: [
        DataBaseModule,
        LoggerModule,
        TypeOrmModule.forFeature([InventoryConfig]),
    ],
    providers: [InventoryConfigTaskService],
})
export class InventoryConfigTaskModule {}

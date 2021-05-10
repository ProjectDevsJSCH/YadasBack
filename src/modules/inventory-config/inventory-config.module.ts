import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataBaseModule } from 'src/database/database.module';
import { InventoryConfig } from './inventory-config.entity';
import { InventoryConfigController } from './inventory-config.controller';
import { InventoryConfigService } from './inventory-config.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([InventoryConfig]),
        DataBaseModule,
    ],
    providers: [InventoryConfigService],
    controllers: [InventoryConfigController],
    exports: [InventoryConfigService],
})
export class InventoryConfigModule { }

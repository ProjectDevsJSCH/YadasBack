import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';

import { IResult } from 'mssql';
import { Repository } from 'typeorm';

import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { InventoryConfig } from './inventory-config.entity';

@Injectable()
export class InventoryConfigService extends TypeOrmCrudService<InventoryConfig> {
    constructor(
        @InjectRepository(InventoryConfig)
        public inventoryConfig: Repository<InventoryConfig>,
        @Inject(DatabaseMediatorService)
        private databaseMediatorService: DatabaseMediatorService,
    ) {
        super(inventoryConfig);
        this.yadasConnection = this.databaseMediatorService.getConnection(DatabaseIdentifier.YADAS);
    }

    private yadasConnection;

    async getSortConfig() {
        const InventoryFields: IResult<Record<string, any>> = await this.yadasConnection
            .connection
            .request()
            .query('SELECT TOP 1 * FROM InventoryGrouped;');

        const fields = Object.keys(InventoryFields.recordset[0]);
        const omitFields = ['Grupo'];

        return {
            columns: fields.filter((field) => !omitFields.includes(field)),
            config: await this.inventoryConfig.find(),
        };
    }
}

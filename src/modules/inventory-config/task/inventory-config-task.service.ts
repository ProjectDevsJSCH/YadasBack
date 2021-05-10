import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IResult } from 'mssql';
import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { LoggerService } from 'src/modules/logger/logger.service';
import { Repository } from 'typeorm';
import { InventoryConfig } from '../inventory-config.entity';

@Injectable()
export class InventoryConfigTaskService {
    constructor(
        @Inject(DatabaseMediatorService)
        private databaseMediator: DatabaseMediatorService,
        @InjectRepository(InventoryConfig)
        public inventoryConfig: Repository<InventoryConfig>,
        private logger: LoggerService,
    ) {
        this.logger.setContext('Inventory Config tasks');
        this.yadasConnection = this.databaseMediator.getConnection(DatabaseIdentifier.YADAS);
        this.updateRegisteredGroups();
    }

    private yadasConnection;

    @Cron(CronExpression.EVERY_DAY_AT_9PM)
    async updateRegisteredGroups() {
        const inventoryGroups: IResult<{ Descripcion: string; }> = await this.yadasConnection
            .connection
            .request()
            .query('SELECT Descripcion FROM [Inventarios - AgrupaciónCuatro];');

        try {
            inventoryGroups.recordset.forEach((group) => {
                (async () => {
                    this.logger.log('Updating group values');

                    const config = await this.inventoryConfig.findOne({
                        table: group.Descripcion,
                    });

                    if (!config) {
                        const newConfig = await this.inventoryConfig.create({
                            table: group.Descripcion,
                            column: '',
                            ascendant: false,
                        });

                        this.logger.log(`New group found ${group.Descripcion}`);

                        newConfig.save();
                    }
                })();
            });
        } catch (error) {
            return {
                complete: false,
                error,
            };
        }

        return {
            complete: true,
        };
    }
}

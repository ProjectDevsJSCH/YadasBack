import {
    Injectable,
    Inject,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { IResult } from 'mssql';
import * as sql from 'sql-bricks';
import * as moment from 'moment';
import { getConnection } from 'typeorm';

import { LoggerService } from 'src/modules/logger/logger.service';
import {
    ColumnsInventoryTable,
    queryInventoryNotificationDto,
    tableNameInventarios,
} from 'src/constants/Inventarios-table';
import { sqlToString } from 'src/utils/sql-bricks.extends';
import { currentZone } from 'src/constants/locale-zone';
import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { NotificationRepository } from '../notification.repository';
import { InventaryViewDto } from '../dto/inventort-view.dto';
import { InventoryNotificationDto } from '../dto/inventory-notification.dto';
import { IdCuentaContable } from '../dto/id-cuenta-contable.enum';
import { NotificationInventoryRepository } from '../inventory-notification.repository';
import { InventoryNotification } from '../inventory-notification.entity';
import { NotificationTypes } from '../dto/notification-types.enum';

@Injectable()
export class NotificationTasksService {
    constructor(
        @Inject(DatabaseMediatorService)
        private databaseMediatorService: DatabaseMediatorService,
        @InjectRepository(NotificationRepository)
        public notificationRepository: NotificationRepository,
        @InjectRepository(NotificationInventoryRepository)
        public notificationInventoryRepository: NotificationInventoryRepository,

        private logger: LoggerService,
    ) {
        this.logger.setContext('NotificationTasksService');
        this.yadasConnection = this.databaseMediatorService.getConnection(DatabaseIdentifier.YADAS);
        this.initVariables();
        this.createInventoryTable();
        this.getIncomingProducts();
    }

    private date: string;

    private yadasConnection;

    private query: sql.SelectStatement;

    @Cron(CronExpression.EVERY_HOUR, { timeZone: currentZone })
    initVariables() {
        this.date = moment().format('YYYY-MM-DD 00:00:00:000');
        this.query = sql.select('*')
            .from('v_InventariosKardexPaso1')
            .where(sql.gte('Fecha', this.date))
            .and(
                sql.or(
                    sql.eq('IdCuentaContableDocumento', IdCuentaContable.IMP),
                    sql.eq('IdCuentaContableDocumento', IdCuentaContable.FC),
                ),
            );
    }

    @Cron(CronExpression.EVERY_HOUR, { timeZone: currentZone })
    async getIncomingProducts() {
        const queryRes: IResult<InventaryViewDto> = await this.yadasConnection.connection
            .request()
            .query(sqlToString(this.query));

        this.logger.debug(`Found notifications, new products: ${queryRes.recordset.length}`);
        const notificationPromises = [];

        await queryRes.recordset.forEach(async (record) => {
            const productQuery = sql.select(
                ...queryInventoryNotificationDto,
            )
                .from(tableNameInventarios)
                .where({ IdInventario: record.IdInventario });

            const product: IResult<InventoryNotificationDto> = await this.yadasConnection.connection
                .request()
                .query(sqlToString(productQuery));

            notificationPromises.push(
                this.notificationRepository.createNewNotification(
                    product.recordset[0],
                    NotificationTypes.MERCHANDISE_UPDATED,
                ),
            );
        });
        await Promise.all(notificationPromises);
    }

    async getAllInventory(): Promise<InventoryNotification[]> {
        const query: sql.SelectStatement = sql
            .select(...queryInventoryNotificationDto)
            .from(tableNameInventarios);

        const { recordset } = await this.yadasConnection.connection
            .request()
            .query(sqlToString(query));

        return recordset.map((record) => InventoryNotification.fromDto(record));
    }

    async createInventoryTable() {
        const { count } = (await getConnection()
            .createQueryBuilder()
            .select('count(*)')
            .from(InventoryNotification, '')
            .execute())[0];

        if (count > 0) {
            return;
        }
        const inventoryData: InventoryNotification[] = await this.getAllInventory();

        await getConnection()
            .createQueryBuilder()
            .insert()
            .into(InventoryNotification)
            .values(
                inventoryData,
            )
            .execute();

        this.logger.debug(`Table inventary_notification created with ${inventoryData.length} rows`);
    }

    @Cron(CronExpression.EVERY_HOUR, { timeZone: currentZone })
    async seeChangeInventoryNotification() {
        this.logger.debug('Searching notifications');
        const query: sql.SelectStatement = sql
            .select(...queryInventoryNotificationDto)
            .from(tableNameInventarios);
        const currentInventoryNotification: IResult<InventoryNotificationDto> = await this
            .yadasConnection.connection
            .request()
            .query(sqlToString(query));

        const notificationPromises = [];

        await currentInventoryNotification.recordset.forEach(async (current) => {
            const saved: InventoryNotification = (await this.notificationInventoryRepository
                .findOne({ where: { IdInventario: current.IdInventario } }));
            let typeNotification: NotificationTypes = NotificationTypes.ENABLED;

            if (!saved) {
                return;
            }

            if (saved.Activo !== current.Activo) {
                if (current.Activo === 0) {
                    typeNotification = NotificationTypes.DISABLED;
                }

                this.logger.debug(`New product ${typeNotification}`);
                notificationPromises.push(
                    this.notificationRepository.createNewNotification(
                        current,
                        typeNotification,
                    ),
                );

                notificationPromises.push(
                    getConnection()
                        .createQueryBuilder()
                        .update(InventoryNotification)
                        .set({ Activo: current.Activo })
                        .where('IdInventario = :id', { id: saved.IdInventario })
                        .execute(),
                );
            }
        });
        await Promise.all(notificationPromises);
        this.logger.debug('Finalize search notifications');
    }

    @Cron(CronExpression.EVERY_HOUR, { timeZone: currentZone })
    async seeAddedInventoryNotification() {
        const queryCount: sql.SelectStatement = sql
            .select('count(*) count')
            .from(tableNameInventarios);
        const currentCount: IResult<{ count: number }> = await this
            .yadasConnection.connection
            .request()
            .query(sqlToString(queryCount));

        const { count } = (await getConnection()
            .createQueryBuilder()
            .select('count(*)')
            .from(InventoryNotification, '')
            .execute())[0];
        const notificationPromises = [];

        if (currentCount.recordset[0].count > count) {
            const query: sql.SelectStatement = sql
                .select(...queryInventoryNotificationDto)
                .from(tableNameInventarios);
            const currentInventoryNotification: IResult<InventoryNotificationDto> = await this
                .yadasConnection.connection
                .request()
                .query(sqlToString(query));

            this.logger.debug(`Found ${currentInventoryNotification.recordset.length - count} new products`);
            await currentInventoryNotification.recordset.forEach(async (record) => {
                if (!(await this.notificationInventoryRepository
                    .findOne({ where: { IdInventario: record.IdInventario } }))
                ) {
                    notificationPromises.push(
                        this.notificationRepository.createNewNotification(
                            record,
                            NotificationTypes.MERCHANDISE_NEW,
                        ),
                    );
                    notificationPromises.push(
                        getConnection()
                            .createQueryBuilder()
                            .insert()
                            .into(InventoryNotification)
                            .values(
                                InventoryNotification.fromDto(record),
                            )
                            .execute(),
                    );
                }
            });
        }
        await Promise.all(notificationPromises);
    }
}

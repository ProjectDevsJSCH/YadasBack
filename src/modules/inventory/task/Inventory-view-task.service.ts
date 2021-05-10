import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

import { IResult } from 'mssql';
import * as sql from 'sql-bricks';
import * as _ from 'lodash';
import * as moment from 'moment';
import { getConnection } from 'typeorm';

import { ColumnsInventoryView } from 'src/constants/inventory-view-table';
import { LoggerService } from 'src/modules/logger/logger.service';
import { sqlToString } from 'src/utils/sql-bricks.extends';
import { IdCuentaContable } from 'src/modules/notifications/dto/id-cuenta-contable.enum';
import { currentZone } from 'src/constants/locale-zone';
import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { InventoryView } from '../inventory-view.entity';
import { InventoryViewRepository } from '../inventory-view.repository';
import { DailyInventoryDto } from '../dto/dayly-movement.dto';
import { DailyInventoryRepository } from '../dayli-inventory.repository';
import { DailyInventory } from '../daily-inventory.entity';

Injectable();
export class InventoryViewTasksService {
    constructor(
        @Inject(DatabaseMediatorService)
        private databaseMediator: DatabaseMediatorService,
        @InjectRepository(InventoryViewRepository)
        public inventoryViewRepository: InventoryViewRepository,
        @InjectRepository(DailyInventoryRepository)
        public dailyInventoryRepository: DailyInventoryRepository,
        private logger: LoggerService,
    ) {
        this.logger.setContext('InventoryViewTasksService');
        moment.locale('es');
        this.buildInventoryView();
        this.buildFirtsTimeDailyInventory();
        this.yadasConnection = this.databaseMediator.getConnection(DatabaseIdentifier.YADAS);
    }

    private yadasConnection

    @Cron(CronExpression.EVERY_DAY_AT_1AM, { timeZone: currentZone })
    async buildInventoryView() {
        const { count } = (await getConnection()
            .createQueryBuilder()
            .select('count(inventory_view.Id)')
            .from(InventoryView, 'inventory_view')
            .execute())[0];

        if (count > 0) {
            return;
        }

        this.buildInventoryViewSenceDate('2018', '01', '01');
    }

    async buildInventoryViewSenceDate(year: string, month: string, day: string) {
        const ALIAS_INVENTORY = 'I';
        const ALIAS_INVENTORY_KARDEX = 'i_k';

        const {
            Fecha,
            IdInventario,
            Descripción,
            Grupo,
            Marca,
            Referencia,
            Cantidad,
            EfectoSobreElInventario,

        } = ColumnsInventoryView;

        const query: sql.SelectStatement = sql.select(
            `${ALIAS_INVENTORY_KARDEX}.${Fecha}`,
            `${ALIAS_INVENTORY_KARDEX}.${IdInventario}`,
            `MIN(${ALIAS_INVENTORY}.${Descripción}) ${Descripción}`,
            `MIN(${ALIAS_INVENTORY}.${Grupo}) ${Grupo}`,
            `MIN(${ALIAS_INVENTORY}.${Marca}) ${Marca}`,
            `MIN(${ALIAS_INVENTORY}.${Referencia}) ${Referencia}`,
            `SUM(${ALIAS_INVENTORY_KARDEX}.${Cantidad}) ${Cantidad}`,
            `${ALIAS_INVENTORY_KARDEX}.${EfectoSobreElInventario} ${EfectoSobreElInventario}`,
        )
            .from(`v_InventariosKardexPaso1 ${ALIAS_INVENTORY_KARDEX}`)
            .join(`InventoryGrouped ${ALIAS_INVENTORY}`)
            .on(
                `${ALIAS_INVENTORY}.${IdInventario}`,
                `${ALIAS_INVENTORY_KARDEX}.${IdInventario}`,
            )
            .where(sql.gt(
                `${ALIAS_INVENTORY_KARDEX}.${Fecha}`,
                `DATETIMEFROMPARTS(${year}, ${month}, ${day}, 00, 00, 00, 000)`,
            ))
            .and(
                sql.or(
                    sql.eq(`${ALIAS_INVENTORY_KARDEX}.IdCuentaContableDocumento`, IdCuentaContable.IMP),
                    sql.eq(`${ALIAS_INVENTORY_KARDEX}.IdCuentaContableDocumento`, IdCuentaContable.FC),
                    sql.eq(`${ALIAS_INVENTORY_KARDEX}.IdCuentaContableDocumento`, IdCuentaContable.FV),

                ),
            )
            .groupBy(
                `${ALIAS_INVENTORY_KARDEX}.${Fecha}`,
                `${ALIAS_INVENTORY_KARDEX}.${IdInventario}`,
                `${EfectoSobreElInventario}`,
            );
        const queryCount: sql.SelectStatement = sql.select('count(*) total')
            .from(`(${sqlToString(query)}) as a`);
        const bashSize: number = 100000;
        const { total } = (await this.yadasConnection.connection
            .request()
            .query(sqlToString(queryCount))).recordset[0];

        this.logger.debug(`Total rows found: ${total} `);

        const step = 1000;
        for (let currentPage = 0; currentPage * bashSize < total; currentPage += 1) {
            const paginationString: string = ` ORDER BY (SELECT NULL)
            OFFSET ${currentPage}*${bashSize} ROWS
            FETCH NEXT ${bashSize} ROWS ONLY`;

            // eslint-disable-next-line no-await-in-loop
            const queryRes: IResult<InventoryView> = await this.yadasConnection.connection
                .request()
                .query(sqlToString(query) + paginationString);

            this.logger.debug(`Inserting ${queryRes.recordset.length} rows`);
            for (let index = 0; index < queryRes.recordset.length; index += step) {
                // eslint-disable-next-line no-await-in-loop
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(InventoryView)
                    .values(
                        queryRes.recordset.slice(index, index + step),
                    )
                    .execute();
            }

            this.logger.debug(`Inserted ${queryRes.recordset.length} rows`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_11PM, { timeZone: currentZone })
    async updateDailyInventory() {
        const query = sql.select('*')
            .from('Vista_Existencias');
        const { recordset } = await this.yadasConnection.connection
            .request()
            .query(sqlToString(query));
        const newInventories = recordset.map((record) => new DailyInventoryDto(
            moment().toDate(),
            record.IdInventario,
            record.Existencia,

        ));
        try {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(DailyInventory)
                .values(
                    newInventories,
                )
                .execute();
        } catch (e) {
            this.logger.error(e);
        }
    }

    async buildDailyInventory() {
        const {
            Fecha,
            IdInventario,
            Cantidad,
            EfectoSobreElInventario,
        } = ColumnsInventoryView;
        const ALIAS_INVENTORY_KARDEX = 'i_k';
        const queryDistincIds = sql.select(`distinct(${ALIAS_INVENTORY_KARDEX}.${IdInventario})`)
            .from(`v_InventariosKardexPaso1 ${ALIAS_INVENTORY_KARDEX}`);

        const { recordset } = await this.yadasConnection.connection
            .request()
            .query(sqlToString(queryDistincIds));
        const ids = recordset.map((e) => e[IdInventario]);
        const queryMovement = sql.select(`
    ${ALIAS_INVENTORY_KARDEX}.${Fecha} date,
    ${ALIAS_INVENTORY_KARDEX}.${EfectoSobreElInventario} * SUM(${ALIAS_INVENTORY_KARDEX}.${Cantidad}) inventory
    `)
            .from(`v_InventariosKardexPaso1 ${ALIAS_INVENTORY_KARDEX}`)
            .groupBy(`
        ${ALIAS_INVENTORY_KARDEX}.${Fecha} ,
        ${ALIAS_INVENTORY_KARDEX}.${EfectoSobreElInventario}
        `)
            .orderBy('Fecha ASC');

        const allMovement: Record<string, DailyInventoryDto[]> = {};

        for (let index = 0; index < ids.length; index += 1) {
            const id = ids[index];
            const querySpecificMovement = queryMovement.clone();

            allMovement[id] = [];
            querySpecificMovement.where(
                sql.eq(`${ALIAS_INVENTORY_KARDEX}.${IdInventario}`, id),
                sql.notEq(`${ALIAS_INVENTORY_KARDEX}.${EfectoSobreElInventario}`, id),
            );
            // eslint-disable-next-line no-await-in-loop
            const movements: IResult<DailyInventoryDto> = (await this.yadasConnection.connection
                .request()
                .query(sqlToString(querySpecificMovement)));
            const groupByDate = _.groupBy(movements.recordset, (e) => e.date);
            let lastinventory = 0;
            Object.entries(groupByDate).forEach(([date, movement]) => {
                let inventory = 0;
                movement.forEach((dailyMovement) => {
                    inventory += dailyMovement.inventory;
                });
                inventory += lastinventory;
                allMovement[id].push(new DailyInventoryDto(
                    moment.utc(date).toDate(),
                    id,
                    inventory,
                ));
                lastinventory = inventory;
            });

            try {
                // eslint-disable-next-line no-await-in-loop
                await getConnection()
                    .createQueryBuilder()
                    .insert()
                    .into(DailyInventory)
                    .values(
                        allMovement[id],
                    )
                    .execute();
            } catch (e) {
                this.logger.error(e);
            }
        }
    }

    async buildFirtsTimeDailyInventory() {
        const { count } = (await getConnection()
            .createQueryBuilder()
            .select('count(daily_inventory.Id)')
            .from(DailyInventory, 'daily_inventory')
            .execute())[0];
        if (count > 0) {
            return;
        }
        this.buildDailyInventory();
    }
}

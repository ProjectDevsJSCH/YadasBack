import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as sql from 'sql-bricks';
import { getConnection, SelectQueryBuilder } from 'typeorm';

import { ColumnsInventoryView } from 'src/constants/inventory-view-table';
import { sqlToString } from 'src/utils/sql-bricks.extends';
import { InventoryViewMovementPerMonth } from 'src/modules/inventory/dto/inventory-view-detail/inventory-movement-month.dto';
import { InventoryViewMovementPerDay } from 'src/modules/inventory/dto/inventory-view-detail/inventory-movement-day.dto';
import { InventoryViewDetailDto } from 'src/modules/inventory/dto/inventory-view-detail/inventory-view-detail.dto';
import { dateToMoment } from 'src/utils/dates';
import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { InventoryViewFilterDto } from './dto/inventory-view-filter.dto';
import { InventoryViewDto } from './dto/inventory-view.dto';
import { InventoryView } from './inventory-view.entity';
import { InventoryViewRepository } from './inventory-view.repository';
import { InventoryViewMovementPerYear } from './dto/inventory-view-detail/inventory-movement-year.dto';
import { DailyInventory } from './daily-inventory.entity';
import { InventoryViewJoinDto } from './dto/inventory-view-join.dto';

@Injectable()
export class InventoryViewService {
    constructor(
        @InjectRepository(InventoryViewRepository)
        public inventoryViewRepository: InventoryViewRepository,
        @Inject(DatabaseMediatorService)
        private databaseMediator: DatabaseMediatorService,

    ) {
        this.tableName = 'inventory_view';
        this.yadasConnection = this.databaseMediator.getConnection(DatabaseIdentifier.YADAS);
    }

    tableName: string = 'inventory_view';

    private yadasConnection;

    async getInventoryViewData(inventoryViewFilterDto: InventoryViewFilterDto) {
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
        let connection: SelectQueryBuilder<InventoryView> = getConnection()
            .createQueryBuilder()
            .select(
                `
                MAX(${this.tableName}.${Fecha}) ${Fecha} ,
                ${this.tableName}.${IdInventario} ,
                MIN(${this.tableName}.${Descripción}) ${Descripción},
                MIN(${this.tableName}.${Grupo}) ${Grupo},
                MIN(${this.tableName}.${Marca}) ${Marca},
                MIN(${this.tableName}.${Referencia}) ${Referencia},
                SUM(${this.tableName}.${Cantidad}) ${Cantidad},
                ${this.tableName}.${EfectoSobreElInventario} ${EfectoSobreElInventario}
                `,
            )
            .from(InventoryView, this.tableName)
            .where(
                `${this.tableName}.Fecha >= Date(:initDate)  and ${this.tableName}.Fecha <= Date(:endDate)`,
                {
                    initDate: inventoryViewFilterDto.fechaInicio,
                    endDate: inventoryViewFilterDto.fechaFinal,
                },
            );

        if (inventoryViewFilterDto.marca) {
            connection = connection.andWhere(
                `${this.tableName}.${Marca} = :brand`,
                {
                    brand: inventoryViewFilterDto.marca,
                },
            );
        }

        if (inventoryViewFilterDto.categoria) {
            connection = connection.andWhere(
                `${this.tableName}.${Grupo} = :group`,
                {
                    group: inventoryViewFilterDto.categoria,
                },
            );
        }

        connection = connection.groupBy(`${this.tableName}.IdInventario, ${this.tableName}.EfectoSobreElInventario`);
        connection = connection.addSelect(`SUM(${this.tableName}.Cantidad)`, 'Movimiento');
        const rows = await connection.execute();

        if (rows.length === 0) {
            return [];
        }

        const records: Record<string, InventoryViewDto> = {};
        const ids: number[] = [];

        for (let index = 0; index < rows.length; index += 1) {
            const record = rows[index];

            if (!records[record.IdInventario]) {
                records[record.IdInventario] = new InventoryViewDto();
                ids.push(parseInt(record.IdInventario, 10));
                records[record.IdInventario].id = record.IdInventario;
                records[record.IdInventario].referencia = record.referencia;
                records[record.IdInventario].descripcion = record.descripción;
                records[record.IdInventario].unidadesEntrantes = 0;
                records[record.IdInventario].unidadesSalientes = 0;
            }

            if (record.efectosobreelinventario === 1) {
                records[record.IdInventario].unidadesEntrantes = record.Movimiento;
            } else if (record.efectosobreelinventario === -1) {
                records[record.IdInventario].unidadesSalientes = record.Movimiento;
            }
        }

        const query = sql.select('IdInventario', 'Precio', 'Existencia')
            .from('InventoryGrouped')
            .where(sql.in('IdInventario', ids));

        (await this.yadasConnection
            .connection
            .request()
            .query(sqlToString(query))).recordset
            .forEach((e) => {
                records[e.IdInventario].inventario = e.Existencia;
                records[e.IdInventario].precio = e.Precio;
            });
        (await getConnection()
            .createQueryBuilder()
            .select(
                `${this.tableName}.${IdInventario} ${IdInventario},
                MAX(${this.tableName}.${Fecha}) ${Fecha}`,
            )
            .from(InventoryView, this.tableName)
            .where(
                `${this.tableName}.IdInventario IN (:...ids)`,
                {
                    ids,
                },
            )
            .groupBy(`${this.tableName}.IdInventario`)
            .execute())
            .forEach((record) => {
                records[record.idinventario].ultimoMovimiento = record.fecha;
            });
        return Object.values(records);
    }

    async getInventoryViewDetail(
        inventoryViewFilterDto: InventoryViewFilterDto,
        idInventory: number,
    ) {
        const DAILY_ALIAS = 'di';
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
        const {
            fechaInicio,
            fechaFinal,
        } = inventoryViewFilterDto;
        let connection: SelectQueryBuilder<InventoryView> = getConnection()
            .createQueryBuilder()
            .select(
                `
                
                ${this.tableName}.${Fecha} ${Fecha},
                ${this.tableName}.${IdInventario},
                ${this.tableName}.${Descripción} ${Descripción},
                ${this.tableName}.${Grupo} ${Grupo},
                ${this.tableName}.${Marca} ${Marca},
                ${this.tableName}.${Referencia} ${Referencia},
                ${this.tableName}.${Cantidad} ${Cantidad},
                ${this.tableName}.${EfectoSobreElInventario} ${EfectoSobreElInventario},
                ${DAILY_ALIAS}.inventory inventory
                `,
            )
            .from(InventoryView, this.tableName)
            .innerJoin(DailyInventory, `${DAILY_ALIAS}`,
                ` ${this.tableName}."IdInventario"=${DAILY_ALIAS}."IdInventory" 
                and ${this.tableName}."Fecha"= ${DAILY_ALIAS}.date`)
            .where(
                `${this.tableName}.Fecha >= Date(:initDate)  and ${this.tableName}.Fecha <= Date(:endDate)`,
                {
                    initDate: fechaInicio,
                    endDate: fechaFinal,
                },
            );

        if (inventoryViewFilterDto.marca) {
            connection = connection.andWhere(
                `${this.tableName}.Marca = :brand`,
                {
                    brand: inventoryViewFilterDto.marca,
                },
            );
        }

        if (inventoryViewFilterDto.categoria) {
            connection = connection.andWhere(
                `${this.tableName}.Grupo = :group`,
                {
                    group: inventoryViewFilterDto.categoria,
                },
            );
        }

        connection = connection.andWhere(
            `${this.tableName}.IdInventario = :idInventory`,
            {
                idInventory,
            },
        );
        connection = connection.addSelect(`${this.tableName}.Cantidad`, 'Movimiento');

        const rows = await connection.execute();
        const records: Record<string, InventoryViewJoinDto> = {};

        for (let index = 0; index < rows.length; index += 1) {
            const record = rows[index];

            if (!records[record.fecha]) {
                records[record.fecha] = new InventoryViewJoinDto();
                records[record.fecha].id = record.IdInventario;
                records[record.fecha].referencia = record.referencia;
                records[record.fecha].descripcion = record.descripción;
                records[record.fecha].ultimoMovimiento = record.fecha;
                records[record.fecha].inventory = record.inventory;
            }

            if (record.efectosobreelinventario === 1) {
                records[record.fecha].unidadesEntrantes = record.Movimiento;
            } else if (record.efectosobreelinventario === -1) {
                records[record.fecha].unidadesSalientes = record.Movimiento;
            }
        }

        const [reference, movementData] = this.getInventoryDetailStruct(fechaInicio, fechaFinal);

        Object.values(records).forEach((record) => {
            const currentDate = dateToMoment(record.ultimoMovimiento);
            reference[currentDate.format('YYYY-MM-DD')].incomming = record.unidadesEntrantes || 0;
            reference[currentDate.format('YYYY-MM-DD')].outcomming = record.unidadesSalientes || 0;
            reference[currentDate.format('YYYY-MM-DD')].day = parseInt(currentDate.format('D'), 10);
            reference[currentDate.format('YYYY-MM-DD')].inventory = record.inventory;
        });

        let lastInventory = 0;
        movementData.yearsMovement.forEach((year) => {
            /* eslint-disable  no-param-reassign */

            year.monthsMovement.forEach((month) => {
                month.daysMovement.forEach((day) => {
                    if (!day.inventory) {
                        day.inventory = lastInventory;
                    }
                    lastInventory = day.inventory;
                    month.incomming += day.incomming || 0;
                    month.outcomming += day.outcomming || 0;
                    month.inventory = day.inventory;
                });
                year.incomming += month.incomming;
                year.outcomming += month.outcomming;
                year.inventory = month.inventory;
            });
        });

        return movementData;
    }

    async getAllBrands() {
        const { Marca } = ColumnsInventoryView;
        const marcs = await getConnection()
            .createQueryBuilder(InventoryView, this.tableName)
            .select(`${this.tableName}.${Marca}`)
            .distinct(true)
            .orderBy(`${this.tableName}.${Marca}`, 'ASC')
            .execute();
        return marcs.map((marc) => (marc.inventory_view_Marca));
    }

    async getAllGroups() {
        const { Grupo } = ColumnsInventoryView;
        const marcs = await getConnection()
            .createQueryBuilder(InventoryView, this.tableName)
            .select(`${this.tableName}.${Grupo}`)
            .distinct(true)
            .orderBy(`${this.tableName}.${Grupo}`, 'ASC')
            .execute();

        return marcs.map((marc) => (marc.inventory_view_Grupo));
    }

    private getInventoryDetailStruct(startDate, stopDate): [
        Record<string, InventoryViewMovementPerDay>,
        InventoryViewDetailDto
    ] {
        const dateReference: Record<string, InventoryViewMovementPerDay> = {};
        let currentDate = dateToMoment(startDate);
        const endDate = dateToMoment(stopDate);

        while (currentDate <= endDate) {
            dateReference[dateToMoment(currentDate).format('YYYY-MM-DD')] = new InventoryViewMovementPerDay();
            dateReference[dateToMoment(currentDate).format('YYYY-MM-DD')].day = +dateToMoment(currentDate).format('D');
            currentDate = moment(currentDate).add(1, 'days');
        }

        const byYear = _.groupBy(
            Object.keys(dateReference),
            (date) => dateToMoment(date).year(),
        );
        const response = new InventoryViewDetailDto();

        Object.keys(byYear).forEach((year) => {
            const currentYear = new InventoryViewMovementPerYear();
            currentYear.year = parseInt(year, 10);
            const byMonths = _.groupBy(
                byYear[year],
                (date) => dateToMoment(date).month(),
            );

            Object.keys(byMonths).forEach((month) => {
                const newMonth = new InventoryViewMovementPerMonth();

                newMonth.month = parseInt(month, 10);
                Object.keys(byMonths[month]).forEach((day) => {
                    const newDay = dateReference[byMonths[month][day]];
                    newDay.date = byMonths[month][day];
                    newMonth.daysMovement.push(newDay);
                });
                currentYear.monthsMovement.push(newMonth);
            });
            response.yearsMovement.push(currentYear);
        });

        return [dateReference, response];
    }
}

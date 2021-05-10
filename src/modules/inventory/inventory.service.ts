import { Injectable, Inject } from '@nestjs/common';

import { omit } from 'lodash';
import { IResult } from 'mssql';
import * as sql from 'sql-bricks';

import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { ENTERPRISE } from 'src/constants/enterprise.enum';
import { sqlToString } from 'src/utils/sql-bricks.extends';
import { GenericDataResponse } from 'src/reponse/interfaces/generic-data-response.interface';
import { MESSAGES } from 'src/reponse';
import { InventoryDto } from './dto/inventory.dto';
import { InventoryGroupDto } from './dto/inventory-group.dto';
import { PromosDto } from './dto/promos.dto';
import { GetInventoryFilterDto } from './dto/get-inventory-filter.dto';
import { User } from '../user/user.entity';
import { UnipartesExistence } from './dto/unipartes-existence.dto';

@Injectable()
export class InventoryService {
    private yadasConnection;

    private unipartesConnection;

    constructor(
        @Inject(DatabaseMediatorService)
        private databaseMediatorService: DatabaseMediatorService,
    ) {
        this.yadasConnection = databaseMediatorService.getConnection(DatabaseIdentifier.YADAS);
        this.unipartesConnection = databaseMediatorService.getConnection(
            DatabaseIdentifier.UNIPARTES,
        );
    }

    async getAllInventory(
        filterDto: GetInventoryFilterDto,
        user: User,
        enterprise: ENTERPRISE,
    ) {
        const databaseIdentifier = enterprise === ENTERPRISE.YADAS
            ? DatabaseIdentifier.YADAS
            : DatabaseIdentifier.UNIPARTES;
        const connection = this.databaseMediatorService.getConnection(databaseIdentifier);
        const query = sql.select('*').from('InventoryGrouped');

        if (filterDto?.showOnlyPromotions === 'true') {
            query.where(sql.gte('CantidadPrecios', 1));
        }

        query.orderBy('Grupo');

        const queryRes: IResult<InventoryDto> = await connection.connection
            .request()
            .query(sqlToString(query));
        const groups = queryRes.recordset.reduce((prev, curr: InventoryDto) => {
            const group = curr.Grupo;
            const item = this.processInventoryItem(curr, user);

            if (prev[group]) prev[group].push(item);
            // eslint-disable-next-line no-param-reassign
            else prev[group] = [item];

            return prev;
        }, {});

        return Object.entries(groups)
            .reduce((list: Array<InventoryGroupDto>, [group, items]: [string, InventoryDto[]]) => {
                list.push({
                    group,
                    items,
                });

                return list;
            }, []);
    }

    async getPromotionsByProduct(id: number) {
        const query = `
            select
                ILPC.RangoIni,
                ILPC.RangoFin,
                ILPC.Dcto,
                ILPC.ListPrecios,
                I.Precio1 "Precio"
            from Inventarios_LstPrecios_Por_Cantidad as ILPC
            join Inventarios as I on ILPC.IdInventario = I.IdInventario
            where I.IdInventario = ${id};
        `;
        const promoData: IResult<PromosDto> = await this
            .yadasConnection.connection
            .request()
            .query(query);

        const promoCalculated = (promoData.recordset as PromosDto[])
            .map((promo) => ({
                ...promo,
                Precio: Math.round(promo.Precio * (1 - promo.Dcto / 100)),
            }));

        return promoCalculated;
    }

    async getAllPromotions() {
        const query = `
            select * from Inventarios_LstPrecios_Por_Cantidad;
        `;
        const promoData: IResult<PromosDto[]> = await this
            .yadasConnection.connection
            .request()
            .query(query);
        const promosData = {};

        (promoData.recordset as unknown as PromosDto[]).forEach((promo) => {
            if (!promosData[promo.IdInventario]) {
                promosData[promo.IdInventario] = [];
            }

            (promosData[promo.IdInventario] as Array<PromosDto>).push(omit(promo, ['IdInventario']));
        });

        return promosData;
    }

    async getProductTypes(databaseIdentifiear: DatabaseIdentifier) {
        const databaseConnection = this.databaseMediatorService
            .getConnection(databaseIdentifiear);
        const query = 'select Descripcion from [Inventarios - AgrupaciónCuatro] order by Descripcion;';
        const queryRes: IResult<{ Descripcion: string; }> = await databaseConnection.connection
            .request()
            .query(query);

        return queryRes.recordset.map((record) => record.Descripcion);
    }

    async getUnipartesStockInventory(): Promise<GenericDataResponse<UnipartesExistence>> {
        const response = <GenericDataResponse<UnipartesExistence>>{};

        const selectInventoryGroupedQuery = `
            SELECT * 
            FROM InventoryGrouped
        `;

        const inventoryGroupedPool = [];

        inventoryGroupedPool.push(this.yadasConnection
            .connection
            .request()
            .query(selectInventoryGroupedQuery));

        inventoryGroupedPool.push(this.unipartesConnection
            .connection
            .request()
            .query(selectInventoryGroupedQuery));

        const [yadasInventoryGrouped, unipartesInventoryGrouped] = await Promise.all(
            inventoryGroupedPool,
        );

        const unipartesMap = unipartesInventoryGrouped.recordset.reduce((map, obj) => {
            // eslint-disable-next-line no-param-reassign
            map[obj.Referencia] = { ...obj };

            return map;
        }, {});

        const matchBetweenDatabases = {};

        yadasInventoryGrouped.recordset.forEach((yadasInv) => {
            matchBetweenDatabases[yadasInv.IdInventario] = {
                idYadas: yadasInv.Referencia,
                stock: unipartesMap[yadasInv.Referencia]
                    ? unipartesMap[yadasInv.Referencia].Existencia : null,
            };
        });

        response.data = matchBetweenDatabases;
        response.message = MESSAGES.SUCCESS;
        response.count = yadasInventoryGrouped.recordset.length;

        return response;
    }

    private omitInventoryFields(user: User) {
        const baseOmit = ['Grupo'];

        if (user.enterprise.enterprise === ENTERPRISE.UNIPARTES) {
            baseOmit.push(
                'CantidadPrecios',
            );
        }

        return baseOmit;
    }

    private processInventoryItem(item: InventoryDto, user: User) {
        const omitItem = item;

        if (user.enterprise.enterprise === ENTERPRISE.UNIPARTES) {
            if (item.Grupo === 'ACEITES') {
                omitItem.Precio = Math.round(omitItem.Precio * 0.85 * 1.13);
            } else {
                omitItem.Precio = Math.round(omitItem.Precio * 0.85 * 1.19 * 1.13);
            }
        }

        const omitFields = this.omitInventoryFields(user);

        return omit(item, omitFields);
    }
}

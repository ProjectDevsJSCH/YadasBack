import { Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IResult } from 'mssql';

import * as sql from 'sql-bricks';
import { ENTERPRISE } from 'src/constants/enterprise.enum';
import { ROLES } from 'src/constants/roles.enum';
import { DatabaseConnection } from 'src/database/database-connection.abstract';

import { DatabaseMediatorService } from 'src/database/database-mediator.service';
import { DatabaseIdentifier } from 'src/database/databases.enum';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthSignUpDto } from 'src/modules/auth/dto/auth-signup.dto';
import { EnterpriseRepository } from 'src/modules/enterprise/enterprise.repository';
import { LoggerService } from 'src/modules/logger/logger.service';
import { RolesRepository } from 'src/modules/roles/roles.repository';
import { sqlToString } from 'src/utils/sql-bricks.extends';
import { UserRepository } from '../user.repository';
import { dataTestUserCreation } from './data-user-creation.test';

export class UserTaskService {
    constructor(
        @Inject(DatabaseMediatorService)
        private databaseMediator: DatabaseMediatorService,
        @Inject(AuthService)
        private authService: AuthService,
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        @InjectRepository(EnterpriseRepository)
        private enterpriseRepository: EnterpriseRepository,
        @InjectRepository(RolesRepository)
        private rolesRepository: RolesRepository,
        private logger: LoggerService,
    ) {
        this.logger.setContext('UserTaskService');
        this.yadasConnection = this.databaseMediator.getConnection(DatabaseIdentifier.YADAS);
    }

    private yadasConnection: DatabaseConnection;

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async createUsers() {
        const TERCEROS = 't';
        const TERCEROS_DIRECCION = 't_d';
        const role = (await this.rolesRepository
            .find({ where: { role: ROLES.VENDOR }, take: 1 }))[0];
        const enterprise = (await this.enterpriseRepository
            .find({ where: { enterprise: ENTERPRISE.YADAS }, take: 1 }))[0];

        const query = sql.select(
            `
            ${TERCEROS_DIRECCION}.EMail  email,
            ${TERCEROS}.Nombre name,
            ${TERCEROS}.Apellidos surname,
            ${role.id} rol,
            ${enterprise.id} enterprise
            `,
        )
            .from(
                `Terceros ${TERCEROS}`,
            )
            .join(
                `[Terceros - Direcciones] ${TERCEROS_DIRECCION}`,
            )
            .on(
                `${TERCEROS}.IdTercero`,
                `${TERCEROS_DIRECCION}.IdTercero`,
            )
            .where(
                sql.and(
                    sql.like(
                        `${TERCEROS}.Propiedades`,
                        '%Vendedor%',
                    ),
                    sql.notEq(
                        `${TERCEROS}.Activo`,
                        0,
                    ),
                    sql.isNotNull(
                        'email',
                    ),
                ),
            );
        const result: IResult<AuthSignUpDto> = await this.yadasConnection
            .connection
            .request()
            .query(sqlToString(query));
        const data: Record<string, any> = {};
        data.production = result;
        data.development = dataTestUserCreation;
        const { recordset } = data[process.env.NODE_ENV];

        const mailsSaved = (await this.userRepository.find()).map((record) => record.email);
        const newUsers = recordset.filter((record) => !mailsSaved.includes(record.email));

        const promises = [];
        newUsers.forEach((record) => {
            promises.push(this.authService.signUp(record, false));
        });
        try {
            await Promise.all(promises);
        } catch (e) {
            this.logger.debug(e);
        }
    }
}

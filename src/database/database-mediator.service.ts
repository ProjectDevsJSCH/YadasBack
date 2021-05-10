import { BadRequestException, Injectable } from '@nestjs/common';

import { ConnectionPool } from 'mssql';
import * as config from 'config';

import { UnipartesConnection } from './unipartes.connection';
import { YadasConnection } from './yadas.connection';
import { DatabaseIdentifier } from './databases.enum';
import { DatabaseConnection } from './database-connection.abstract';

const DB_CONFIG = config.get('db') as Record<string, any>;

@Injectable()
export class DatabaseMediatorService {
    private databases = new Map<DatabaseIdentifier, DatabaseConnection>();

    private connectionServices = [
        UnipartesConnection,
        YadasConnection,
    ]

    constructor() { }

    getConnection(databaseName: DatabaseIdentifier): DatabaseConnection {
        const databaseConnection = this.databases.get(databaseName);
        if (!databaseConnection) {
            throw new BadRequestException({ message: `La empresa ${databaseName} no esta registrada en nuestro sistema` });
        }
        return databaseConnection;
    }

    public async initializeConnections() {
        const connectionsPools = [];

        this.connectionServices.forEach((Service) => {
            const connection = new ConnectionPool(
                {
                    ...this.buildBaseConfiguration(Service.identifier),
                    ...Service.getConnectionConfiguration(),
                },
                (error) => {
                    if (error) {
                        throw new Error(`Error handling ${Service.identifier} connection error:${error}`);
                    }
                },
            );

            connectionsPools.push(
                connection.connect()
                    .then((connectionPool) => this.databases.set(
                        Service.identifier, new Service(connectionPool),
                    )),
            );
        });

        await Promise.all(connectionsPools);
    }

    private buildBaseConfiguration(configurationName: string) {
        const CONFIGURATION_NAME = configurationName.toUpperCase();

        return {
            user: process.env[`DB_${CONFIGURATION_NAME}_USERNAME`] || DB_CONFIG[configurationName].username,
            password: process.env[`DB_${CONFIGURATION_NAME}_PASSWORD`] || DB_CONFIG[configurationName].password,
            server: process.env[`DB_${CONFIGURATION_NAME}_HOST`] || DB_CONFIG[configurationName].host,
            database: process.env[`DB_${CONFIGURATION_NAME}_DATABASE`] || DB_CONFIG[configurationName].database,
            port: process.env[`DB_${CONFIGURATION_NAME}_PORT`] || DB_CONFIG[configurationName].port,
        };
    }
}

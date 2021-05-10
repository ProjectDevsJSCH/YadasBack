import { Injectable } from '@nestjs/common';

import * as config from 'config';
import { ConnectionPool, config as SQLConfig } from 'mssql';

const DB_CONFIG = config.get('db') as any;

@Injectable()
export class YadasConnectionService {
    constructor(public connection: ConnectionPool) { }

    static getConnectionConfiguration(): SQLConfig {
        return {
            user: process.env.DB_YADAS_USERNAME || DB_CONFIG.yadas.username,
            requestTimeout: 30000,
            password: process.env.DB_YADAS_PASSWORD || DB_CONFIG.yadas.password,
            server: process.env.DB_YADAS_HOST || DB_CONFIG.yadas.host,
            database: process.env.DB_YADAS_DATABASE || DB_CONFIG.yadas.database,
        };
    }
}

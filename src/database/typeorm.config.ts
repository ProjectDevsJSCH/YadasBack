import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';
import * as config from 'config';

const vars = require('dotenv').config({});

const logger = new Logger('typeorm.config');
const DB_CONFIG = config.get('db') as Record<string, any>;

logger.debug(`Main host: ${DB_CONFIG.main.host}`);
logger.debug(`Enviroment: ${process.env.NODE_ENV}`);

const MAIN_CONFIG: any = {
    type: DB_CONFIG.main.type,
    host: process.env.DB_MAIN_HOST || DB_CONFIG.main.host,
    port: DB_CONFIG.main.port,
    username: process.env.DB_MAIN_USERNAME || DB_CONFIG.main.username,
    password: process.env.DB_MAIN_PASSWORD || DB_CONFIG.main.password,
    database: process.env.DB_MAIN_DATABASE || DB_CONFIG.main.database,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    synchronize: process.env.DB_MAIN_SYNCHRONIZE || DB_CONFIG.main.synchronize,
    migrations: ['migrations/*.ts'],
    migrationsTableName: 'migrations_records',
    logging: true,
    logger: 'file',
    cli: {
        migrationsDir: 'migrations/',
    },
};
if (DB_CONFIG.main.ssl === true) {
    MAIN_CONFIG.ssl = {
        rejectUnauthorized: false,
    };
}

export default MAIN_CONFIG as TypeOrmModuleOptions;

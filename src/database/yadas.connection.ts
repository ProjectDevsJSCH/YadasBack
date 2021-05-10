import { config as SQLConfig, ConnectionPool } from 'mssql';
import { DatabaseConnection } from './database-connection.abstract';

import { DatabaseIdentifier } from './databases.enum';

export class YadasConnection extends DatabaseConnection {
    constructor(public connection: ConnectionPool) {
        super(connection);
    }

    static readonly identifier = DatabaseIdentifier.YADAS;

    static getConnectionConfiguration(): Partial<SQLConfig> {
        return {
        };
    }
}

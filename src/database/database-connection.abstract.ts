import { config as SQLConfig, ConnectionPool } from 'mssql';
import { DatabaseIdentifier } from './databases.enum';

export abstract class DatabaseConnection {
    constructor(public connection: ConnectionPool) {}

    static readonly identifier: DatabaseIdentifier;

    static getConnectionConfiguration(): Partial<SQLConfig> {
        return null;
    }
}

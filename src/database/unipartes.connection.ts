import { ConnectionPool, config as SQLConfig } from 'mssql';
import { DatabaseConnection } from './database-connection.abstract';
import { DatabaseIdentifier } from './databases.enum';

export class UnipartesConnection extends DatabaseConnection {
    constructor(public connection: ConnectionPool) {
        super(connection);
    }

    static readonly identifier = DatabaseIdentifier.UNIPARTES;

    static getConnectionConfiguration(): Partial<SQLConfig> {
        const baseConfiguration = {
            options: {
                encrypt: false,
            },
        };

        return baseConfiguration;
    }
}

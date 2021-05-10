import { Module } from '@nestjs/common';

import { DatabaseMediatorService } from './database-mediator.service';

@Module({
    providers: [
        {
            provide: DatabaseMediatorService,
            useFactory: async () => {
                const connection = new DatabaseMediatorService();
                await connection.initializeConnections();

                return connection;
            },
        },
    ],
    exports: [
        DatabaseMediatorService,
    ],
})
export class DataBaseModule { }

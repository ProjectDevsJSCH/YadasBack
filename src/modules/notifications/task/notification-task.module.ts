import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataBaseModule } from 'src/database/database.module';
import { LoggerModule } from 'src/modules/logger/logger.module';
import { NotificationInventoryRepository } from '../inventory-notification.repository';
import { NotificationRepository } from '../notification.repository';
import { NotificationTasksService } from './notification-task.service';

@Module({
    imports: [
        DataBaseModule,
        TypeOrmModule.forFeature([
            NotificationRepository,
            NotificationInventoryRepository,
        ]),
        LoggerModule,
    ],
    providers: [NotificationTasksService],
})
export class NotificationTasksModule { }

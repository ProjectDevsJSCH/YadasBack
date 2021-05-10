import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataBaseModule } from 'src/database/database.module';
import { NotificationInventoryRepository } from './inventory-notification.repository';
import { NotificationRepository } from './notification.repository';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
    imports: [
        DataBaseModule,
        TypeOrmModule.forFeature([
            NotificationInventoryRepository,
            NotificationRepository,
        ]),
    ],
    providers: [NotificationsService],
    controllers: [NotificationsController],
})
export class NotificationsModule { }

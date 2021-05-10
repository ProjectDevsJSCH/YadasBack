import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as moment from 'moment';
import { MoreThanOrEqual } from 'typeorm';

import { NotificationWithProduct } from './dto/notification-with-product.dto';
import { NotificationRepository } from './notification.repository';
import { Notificaciones } from './notifications.entity';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(NotificationRepository)
        public notificationRepository: NotificationRepository,
    ) {

    }

    async getNotifications(): Promise<NotificationWithProduct[]> {
        const date30DaysBefore = moment().subtract(30, 'days');

        const queryRes: Notificaciones[] = await this.notificationRepository.find({
            order: {
                fecha: 'DESC',
            },
            where: {
                fecha: MoreThanOrEqual(date30DaysBefore.format('YYYY-MM-DD')),
            },
        });

        return queryRes.map((record) => NotificationWithProduct.fromNotification(record));
    }
}

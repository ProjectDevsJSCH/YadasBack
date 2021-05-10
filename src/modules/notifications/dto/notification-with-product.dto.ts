import { Notificaciones } from '../notifications.entity';
import { NotificationDto } from './notification.dto';

export class NotificationWithProduct extends NotificationDto {
    constructor() {
        super();
    }

    static fromNotification(notification: Notificaciones): NotificationWithProduct {
        const notificationdDto = new this();

        Object.assign(notificationdDto, notification);
        notificationdDto.producto = {
            Descripcion: notification.descripcion,
            Referencia: notification.referencia,
        };

        return notificationdDto;
    }

    producto: {
        Referencia: string;
        Descripcion: string;
    };
}

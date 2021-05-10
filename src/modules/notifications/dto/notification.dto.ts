import { NotificationTypes } from './notification-types.enum';

export class NotificationDto {
    id: number;

    tipo: NotificationTypes;

    idProducto: number;

    fecha: string;
}

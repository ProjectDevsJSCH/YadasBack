import { Repository, EntityRepository, getConnection } from 'typeorm';
import * as moment from 'moment';

import { ColumnsToOmit } from 'src/constants/omit-notification';
import { Notificaciones } from './notifications.entity';
import { NotificationTypes } from './dto/notification-types.enum';
import { InventoryNotificationDto } from './dto/inventory-notification.dto';
import { LoggerService } from '../logger/logger.service';

@EntityRepository(Notificaciones)
export class NotificationRepository extends Repository<Notificaciones> {
    constructor(
        private logger: LoggerService,

    ) {
        super();
    }

    async createNewNotification(
        productDto: InventoryNotificationDto,
        typeNotification: NotificationTypes,
    ): Promise<Notificaciones> {
        if (this.omitNotification(productDto)) {
            return null;
        }

        const notificacion = new Notificaciones();

        notificacion.fecha = moment().format('YYYY-MM-DD hh:mm:ss:SSS');
        notificacion.idProducto = parseInt(productDto.IdInventario, 10);
        notificacion.tipo = typeNotification;
        notificacion.referencia = productDto.CódigoInventario;
        notificacion.descripcion = productDto.Descripción;

        const existsNotification = (await this.findOne({
            where: {
                idProducto: notificacion.idProducto,
            },
        }));

        if (existsNotification) {
            await getConnection()
                .createQueryBuilder()
                .update(Notificaciones)
                .set({
                    tipo: typeNotification,
                    fecha: notificacion.fecha,
                })
                .where('idProducto = :idProducto', { idProducto: notificacion.idProducto })
                .execute();
        } else {
            notificacion.save();
        }

        return notificacion;
    }

    private omitNotification(item: InventoryNotificationDto): boolean {
        if (item.IdGrupoInventarioUno !== 2) {
            return true;
        }

        return Object.entries(ColumnsToOmit)
            .every(([column, values]) => values.includes(item[column]));
    }
}

import { validateOrReject } from 'class-validator';
import {
    BaseEntity,
    Column,
    Entity,
    BeforeInsert,
    BeforeUpdate,
    PrimaryColumn,
} from 'typeorm';

import { InventoryNotificationDto } from './dto/inventory-notification.dto';
import { NotificationTypes } from './dto/notification-types.enum';

@Entity()
export class InventoryNotification extends BaseEntity {
    @PrimaryColumn()
    IdInventario: number;

    @Column()
    Descripción: NotificationTypes;

    @Column()
    CódigoInventario: string;

    @Column()
    Activo: number;

    @Column({ nullable: true })
    IdGrupoInventarioDos: number;

    @Column({ nullable: true })
    IdGrupoInventarioCuatro: number;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }

    static fromDto(dto: InventoryNotificationDto): InventoryNotification {
        const notificationInventory = new this();

        Object.assign(notificationInventory, dto);
        return notificationInventory;
    }
}

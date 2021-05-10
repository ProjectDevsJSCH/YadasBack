import { validateOrReject } from 'class-validator';
import {
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

import { NotificationTypes } from './dto/notification-types.enum';

@Entity()
export class Notificaciones extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipo: NotificationTypes;

    @Column()
    idProducto: number;

    @Column()
    fecha: string;

    @Column()
    descripcion: string;

    @Column()
    referencia: string;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

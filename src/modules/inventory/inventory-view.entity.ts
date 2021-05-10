import { validateOrReject } from 'class-validator';
import {
    BaseEntity, Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class InventoryView extends BaseEntity {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    IdInventario: number;

    @Column()
    Grupo: string;

    @Column()
    Marca: string;

    @Column()
    Referencia: string;

    @Column()
    Cantidad: number;

    @Column()
    EfectoSobreElInventario: number;

    @Column({ type: 'date' })
    Fecha: Date

    @Column()
    Descripción: string

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

import { validateOrReject } from 'class-validator';
import {
    BaseEntity, BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DailyInventory extends BaseEntity {
    @PrimaryGeneratedColumn()
    Id: number;

    @Column()
    IdInventory: number;

    @Column('decimal', { precision: 28, scale: 6 })
    inventory: number;

    @Column({ type: 'date' })
    date: Date;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

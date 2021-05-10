import {
    BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique,
} from 'typeorm';

@Entity()
@Unique(['table'])
export class InventoryConfig extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    table: string;

    @Column()
    column: string;

    @Column({
        type: 'boolean',
        default: false,
    })
    ascendant: boolean;
}

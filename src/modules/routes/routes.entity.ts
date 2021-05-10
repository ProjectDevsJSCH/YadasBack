import { validateOrReject } from 'class-validator';

import {
    BaseEntity,
    Column,
    Entity,
    BeforeInsert,
    BeforeUpdate,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';

import { RolesEnterprise } from '../roles-enterprise/roles-enterprise.entity';
import { RolesEnterpriseRepository } from '../roles-enterprise/roles-enterprise.repository';

@Entity()
export class Routes extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    route: string;

    @Column({ default: '' })
    alias: string;

    @ManyToMany(() => RolesEnterprise, (rolesenterprise) => rolesenterprise.id)
    @JoinTable()
    rolesEnterprise: RolesEnterpriseRepository[];

    @Column({ unique: true })
    path: string;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

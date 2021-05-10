import { validateOrReject } from 'class-validator';

import {
    BaseEntity,
    Entity,
    BeforeInsert,
    BeforeUpdate,
    ManyToOne,
    Generated,
    PrimaryColumn,
    JoinColumn,
    PrimaryGeneratedColumn,
    Column,
    Index,
} from 'typeorm';

import { Enterprise } from 'src/modules/enterprise/enterprise.entity';
import { Roles } from '../roles/roles.entity';

@Entity()
@Index('index_item_sequence', ['roleId', 'enterpriseId'], { unique: true })
export class RolesEnterprise extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    roleId: number;

    @Column()
    enterpriseId: number;

    @ManyToOne(() => Roles, (role) => role.roleEnterprise)
    @JoinColumn({ name: 'roleId' })
    role: Roles;

    @ManyToOne(() => Enterprise, (enterprise) => enterprise.roleEnterprise)
    @JoinColumn({ name: 'enterpriseId' })
    enterprise: Enterprise;

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

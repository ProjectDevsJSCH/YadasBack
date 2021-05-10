import { validateOrReject } from 'class-validator';
import { ROLES } from 'src/constants/roles.enum';
import {
    BaseEntity,
    Column, Entity,
    BeforeInsert,
    BeforeUpdate,
    PrimaryGeneratedColumn,
    OneToMany,
} from 'typeorm';
import { RolesEnterprise } from '../roles-enterprise/roles-enterprise.entity';

@Entity()
export class Roles extends BaseEntity {
    constructor(
        role?,
        description = '',
        alias = '',
    ) {
        super();
        this.alias = alias;
        this.role = role;
        this.description = description;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ROLES,
        unique: true,
    })
    role: ROLES;

    @Column({ default: '' })
    description: string;

    @Column({ default: '' })
    alias: string;

    @OneToMany(() => RolesEnterprise, (rolesEnterprise) => rolesEnterprise.role)
    roleEnterprise: RolesEnterprise[];

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

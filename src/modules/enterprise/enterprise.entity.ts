import { validateOrReject } from 'class-validator';
import { ENTERPRISE } from 'src/constants/enterprise.enum';
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
export class Enterprise extends BaseEntity {
    constructor(
        enterprise?,

    ) {
        super();
        this.enterprise = enterprise;
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ENTERPRISE,
        unique: true,
    })
    enterprise: ENTERPRISE;

    @OneToMany(() => RolesEnterprise, (rolesEnterprise) => rolesEnterprise.enterprise)
    roleEnterprise: RolesEnterprise[];

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

import * as bcrypt from 'bcrypt';
import { validateOrReject } from 'class-validator';
import {
    BaseEntity,
    PrimaryGeneratedColumn,
    Column,
    Entity,
    Unique,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
    ManyToOne,

} from 'typeorm';
import { Enterprise } from '../enterprise/enterprise.entity';
import { Roles } from '../roles/roles.entity';

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @ManyToOne(() => Roles, (rol) => rol.id)
    @JoinColumn({ name: 'role' })
    rol: Roles;

    @ManyToOne(() => Enterprise, (enterprise) => enterprise.id)
    @JoinColumn({ name: 'enterprise' })
    enterprise: Enterprise;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    salt: string;

    @Column({ nullable: true })
    resetToken: string;

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);

        return hash === this.password;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        await validateOrReject(this);
    }
}

import { Repository, EntityRepository, getConnection } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DatabaseErrors } from 'src/database/db-errors.enum';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import { AuthSignUpDto } from '../auth/dto/auth-signup.dto';
import { Roles } from '../roles/roles.entity';
import { Enterprise } from '../enterprise/enterprise.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(
        authSignUpDto: AuthSignUpDto,
        resetToken: string,
        usePasssword: boolean,
    ): Promise<void> {
        const {
            email, name, surname, rol, enterprise, password,
        } = authSignUpDto;
        const user = new User();

        user.email = email;
        user.name = name;
        user.rol = new Roles();
        user.rol.id = rol;
        user.enterprise = new Enterprise();
        user.enterprise.id = enterprise;
        user.surname = surname;
        if (usePasssword) {
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(password, salt);
            user.salt = salt;
        } else {
            user.resetToken = resetToken;
        }

        try {
            await user.save();
        } catch (error) {
            if (error.code === DatabaseErrors.DUPLICATE_KEY) {
                throw new ConflictException('Email already exists');
            }

            throw new InternalServerErrorException({ message: error });
        }
    }

    async updatePassword(email: string, password: string) {
        const salt = await bcrypt.genSalt();
        const encriptedPassword = await bcrypt.hash(password, salt);
        await this.update(
            { email },
            { password: encriptedPassword, salt, resetToken: null },
        );
    }

    static getValidIds(Entity, nameTable) {
        let response: any[];
        const ids = getConnection()
            .createQueryBuilder()
            .select('id')
            .from(Entity, nameTable)
            .distinct(true)
            .execute();
        ids.then((res) => {
            response = res.map((id) => id.id.toString());
        });

        return response;
    }
}

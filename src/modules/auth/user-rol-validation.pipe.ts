import {
    PipeTransform, BadRequestException, Injectable, Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EnterpriseRepository } from '../enterprise/enterprise.repository';
import { RolesRepository } from '../roles/roles.repository';
import { AuthSignUpDto } from './dto/auth-signup.dto';

@Injectable()
export class UserRolValidationPipe implements PipeTransform {
    constructor(
        @InjectRepository(EnterpriseRepository)
        private enterpriseRepository: EnterpriseRepository,
        @InjectRepository(RolesRepository)
        private rolesRepository: RolesRepository,

    ) {

    }

    async transform(user: AuthSignUpDto) {
        if (!(await this.isValidUser(user))) {
            throw new BadRequestException(`"${user}" is an invalid user`);
        }

        return user;
    }

    private async isValidUser(user: AuthSignUpDto): Promise<boolean> {
        const validEnterprise = await this.enterpriseRepository.fetchValidEnterprises();
        const validRoles = await this.rolesRepository.fetchValidRoles();
        const idEnterprise = validEnterprise.indexOf(String(user.enterprise));
        const idRoles = validRoles.indexOf(user.rol);

        return idEnterprise !== -1 && idRoles !== -1;
    }
}

import { BadGatewayException } from '@nestjs/common';

import { Repository, EntityRepository, getConnection } from 'typeorm';

import { ROLES } from 'src/constants/roles.enum';
import { DatabaseErrors } from 'src/database/db-errors.enum';
import { Roles } from './roles.entity';

@EntityRepository(Roles)
export class RolesRepository extends Repository<Roles> {
    async fetchValidRoles() {
        const ids = (await getConnection()
            .createQueryBuilder()
            .select('id')
            .from(Roles, 'roles')
            .distinct(true)
            .execute());

        return ids.map((id) => id.id.toString());
    }

    public async seed() {
        const results = [];
        const aliasMapping: Record<ROLES, string> = {
            [ROLES.ADMIN]: 'Administrador',
            [ROLES.VENDOR]: 'Vendedor',
            [ROLES.WAREHOUSE]: 'Bodega',
            [ROLES.ROLE_ADMIN]: 'Gestor de cuentas',
        };

        Object.values(ROLES).forEach((role) => {
            results.push(
                this.create({
                    role,
                    alias: aliasMapping[role],
                }).save(),
            );
        });

        try {
            await Promise.all(results);
        } catch (e) {
            if (e.code !== DatabaseErrors.DUPLICATE_KEY) {
                throw new BadGatewayException({ error: e });
            }
        }
    }
}

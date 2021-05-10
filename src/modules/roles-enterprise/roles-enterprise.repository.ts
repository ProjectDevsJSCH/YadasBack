import { BadGatewayException } from '@nestjs/common';
import { DatabaseErrors } from 'src/database/db-errors.enum';
import { EnterpriseRepository } from 'src/modules/enterprise/enterprise.repository';
import { Repository, EntityRepository, getConnection } from 'typeorm';
import { RolesRepository } from '../roles/roles.repository';
import { RolesEnterprise } from './roles-enterprise.entity';

@EntityRepository(RolesEnterprise)
export class RolesEnterpriseRepository extends Repository<RolesEnterprise> {
    constructor(
    ) {
        super();
    }

    async fetchValidRolesEnterprise() {
        const ids = (await getConnection()
            .createQueryBuilder()
            .select('id')
            .from(RolesEnterprise, 'roles_enterprise')
            .distinct(true)
            .execute());

        return ids.map((id) => id.id.toString());
    }

    public async seed(
        enterpriseRepository: EnterpriseRepository,
        roleRepository: RolesRepository,
    ) {
        try {
            await enterpriseRepository.seed();
        } catch (error) {
            throw new BadGatewayException({ error });
        }
        await roleRepository.seed();
        const validEnterpriseIds = await enterpriseRepository.fetchValidEnterprises();
        const validRolesIds = await roleRepository.fetchValidRoles();
        const results = [];
        const enterprises = validEnterpriseIds.map((id) => ({ id: +id }));
        const roles = validRolesIds.map((id) => ({ id: +id }));
        roles.forEach((role) => {
            enterprises.forEach((enterprise) => {
                results.push(this.save({
                    role,
                    enterprise,
                }));
            });
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

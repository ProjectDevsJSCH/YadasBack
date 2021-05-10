import { BadGatewayException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENTERPRISE } from 'src/constants/enterprise.enum';
import { DatabaseErrors } from 'src/database/db-errors.enum';
import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Enterprise } from './enterprise.entity';

@EntityRepository(Enterprise)
export class EnterpriseRepository extends Repository<Enterprise> {
    public async fetchValidEnterprises(): Promise<string[]> {
        const ids = (await getConnection()
            .createQueryBuilder()
            .select('id')
            .from(Enterprise, 'enterprise')
            .distinct(true)
            .execute());

        return ids.map((id) => id.id.toString());
    }

    public async seed() {
        const results = [];
        Object.values(ENTERPRISE).forEach((enterprise) => {
            results.push(this.save(
                new Enterprise(enterprise),
            ));
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

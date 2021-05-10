import { Repository, EntityRepository } from 'typeorm';
import { Routes } from './routes.entity';

@EntityRepository(Routes)
export class RoutesRepository extends Repository<Routes> {

}

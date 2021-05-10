import { Repository, EntityRepository } from 'typeorm';
import { DailyInventory } from './daily-inventory.entity';

@EntityRepository(DailyInventory)
export class DailyInventoryRepository extends Repository<DailyInventory> {

}

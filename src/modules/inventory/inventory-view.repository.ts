import { Repository, EntityRepository } from 'typeorm';
import { InventoryView } from './inventory-view.entity';

@EntityRepository(InventoryView)
export class InventoryViewRepository extends Repository<InventoryView> {

}

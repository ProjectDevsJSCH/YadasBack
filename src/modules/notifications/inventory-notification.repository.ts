import { Repository, EntityRepository } from 'typeorm';
import { InventoryNotification } from './inventory-notification.entity';

@EntityRepository(InventoryNotification)
export class NotificationInventoryRepository extends Repository<InventoryNotification> {

}

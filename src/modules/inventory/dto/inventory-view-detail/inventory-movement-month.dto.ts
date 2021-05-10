import { InventoryViewMovementPerDay } from './inventory-movement-day.dto';
import { InventoryMovement } from './inventory-movement.dto';

export class InventoryViewMovementPerMonth extends InventoryMovement {
    month: number;

    daysMovement: InventoryViewMovementPerDay[] = []
}

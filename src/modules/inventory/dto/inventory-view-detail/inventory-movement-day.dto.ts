import { InventoryMovement } from './inventory-movement.dto';

export class InventoryViewMovementPerDay extends InventoryMovement {
    day: number;

    date: string;

    inventory = null;
}

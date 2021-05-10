import { InventoryViewMovementPerMonth } from './inventory-movement-month.dto';
import { InventoryMovement } from './inventory-movement.dto';

export class InventoryViewMovementPerYear extends InventoryMovement {
    year: number;

    monthsMovement: InventoryViewMovementPerMonth[]=[]
}

import { InventoryViewMovementPerMonth } from './inventory-movement-month.dto';
import { InventoryViewMovementPerYear } from './inventory-movement-year.dto';

export class InventoryViewDetailDto {
    currentInventory: number;

    yearsMovement: InventoryViewMovementPerYear[]=[];
}

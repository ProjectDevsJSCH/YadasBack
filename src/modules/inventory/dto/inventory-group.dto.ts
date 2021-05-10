import { InventoryDto } from './inventory.dto';

export class InventoryGroupDto {
    group: string;

    items: InventoryDto[];
}

import { Paginable } from 'src/shared/pagination/paginable.dto';

export class GetInventoryFilterDto extends Paginable {
    showOnlyPromotions: string;
}

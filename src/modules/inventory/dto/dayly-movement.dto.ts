export class DailyInventoryDto {
    constructor(
        public date: Date,
        public IdInventory: number = 0,
        public inventory: number = 0,
    ) {

    }
}

import { IdCuentaContable } from './id-cuenta-contable.enum';

export class InventaryViewDto {
    IdInventario: number

    IdCuentaContableDocumento: IdCuentaContable

    Cantidad: number

    Renglón: number
}

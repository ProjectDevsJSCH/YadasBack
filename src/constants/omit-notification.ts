import { ColumnsInventoryTable } from './Inventarios-table';

export const IdJGK = 34;
export const IdBieletas = 6;

export const ColumnsToOmit = {
    [ColumnsInventoryTable.IdGrupoInventarioCuatro]: [
        IdBieletas,
    ],
    [ColumnsInventoryTable.IdGrupoInventarioDos]: [
        IdJGK,
    ],
};

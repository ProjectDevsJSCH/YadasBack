export const ColumnsInventoryTable = {
    IdInventario: 'IdInventario',
    Descripción: 'Descripción',
    CódigoInventario: 'CódigoInventario',
    Activo: 'Activo',
    IdGrupoInventarioUno: 'IdGrupoInventarioUno',
    IdGrupoInventarioDos: 'IdGrupoInventarioDos',
    IdGrupoInventarioCuatro: 'IdGrupoInventarioCuatro',
};

export const tableNameInventarios: string = 'Inventarios';
export const queryInventoryNotificationDto: Array<string> = Object.values(ColumnsInventoryTable);

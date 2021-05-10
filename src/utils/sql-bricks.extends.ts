import * as sql from 'sql-bricks';

export function sqlToString(query: sql.SelectStatement): string {
    const re = /('(DATETIMEFROMPARTS\((\d+, )+\d+\))')/g;
    return query.toString().replace(/"/g, '').replace(re, '$2');
}

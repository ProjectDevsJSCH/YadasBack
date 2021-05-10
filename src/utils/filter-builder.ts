interface FilterClause {
    type: string;
    value: string;
}

export class FilterBuilder {
    private clauses: Array<FilterClause> = [];

    constructor(baseClause: string) {
        this.clauses.push({
            type: 'BASE',
            value: baseClause,
        });
    }

    and(clause: string) {
        this.clauses.push({
            type: 'AND',
            value: clause,
        });

        return this;
    }

    or(clause: string) {
        this.clauses.push({
            type: 'OR',
            value: clause,
        });

        return this;
    }

    cleanClauses() {
        this.clauses = [];
    }

    getFilter(): string {
        if (!this.clauses.length) {
            return '';
        }

        const filterQuery = `WHERE ${this.clauses[0].value}`;
        const tailClauses = this.clauses.reduce((base: string, clause: FilterClause) => `${base}${clause.type} ${clause.value} `, '');

        return `${filterQuery} ${tailClauses}`;
    }
}

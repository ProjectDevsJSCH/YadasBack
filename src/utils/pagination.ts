import { PaginationRequest } from 'src/shared/pagination/pagination-request.interface';
import { PaginationResponse } from 'src/shared/pagination/pagination-response.interface';

export class PaginationUtil {
    static getPaginatedElements(
        rawData: any[],
        paginationDto: Record<any, any> & PaginationRequest,
    ): PaginationResponse {
        const page = paginationDto.page || 1;
        const itemsPerPage = paginationDto.itemsPerPage || 4;
        const start = (page - 1) * itemsPerPage;

        return {
            data: rawData.slice(start, start + itemsPerPage),
            page,
            pages: Math.ceil(rawData.length / itemsPerPage),
            total: rawData.length,
        };
    }

    static generatePaginationQuery(page: number, itemsPerPage: number) {
        return `OFFSET ${(page - 1) * itemsPerPage} FETCH NEXT ${itemsPerPage} ROWS ONLY`;
    }
}

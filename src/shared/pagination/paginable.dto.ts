import { PaginationRequest } from './pagination-request.interface';

export class Paginable implements PaginationRequest {
    page?: number;

    itemsPerPage?: number;
}

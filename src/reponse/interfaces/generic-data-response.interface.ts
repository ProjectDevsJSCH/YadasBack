export interface GenericDataResponse<T> {
    message: string;
    count: number;
    data: T[] | {};
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface ApiPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiPaginatedResponse<T> {
    success: boolean;
    message?: string;
    meta: ApiPaginationMeta;
    data: T[];
}
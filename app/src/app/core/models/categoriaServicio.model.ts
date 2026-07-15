export interface CategoriaServicio {
    id: number;
    categoria: string;
    descripcion: string;
    estado: boolean;

    createdAt?: string;
    updateAt?: string;
}

export interface CategoriaServicioCreateDto {
    categoria: string;
    descripcion: string;
    estado?: boolean;
}

export interface CategoriaServicioUpdateDto {
    categoria?: string;
    descripcion?: string;
    estado?: boolean;
}
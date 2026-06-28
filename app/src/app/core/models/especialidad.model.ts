export interface Especialidad {
    id: number;
    especialidad: string;
    descripcion?: string;
    estado: boolean;
    createdAt?: string;
    updateAt?: string;
}

export interface EspecialidadCreateDto {
    especialidad: string;
    descripcion: string;
    estado?: boolean;
    perfiles_profesionales?: number[];
    servicios?: number[];
}

export interface EspecialidadUpdateDto {
    especialidad?: string;
    descripcion?: string;
    estado?: boolean;
    perfiles_profesionales?: number[];
    servicios?: number[];
}
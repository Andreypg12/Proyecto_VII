export interface Especialidad {
    id: number;
    estado: boolean;
    especialidad: string;
    descripcion: string;
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
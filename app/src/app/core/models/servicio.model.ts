export type Modalidad = 'PRESENCIAL' | 'VIRTUAL' | 'HÍBRIDA';

export interface Servicio {
    id: number;
    servicio: string;
    descripcion: string;
    precio: number;
    duracion_estimada: number;
    estado: boolean;
    Modalidad: Modalidad;
}

/* export interface UsuarioCreateDto {
    email: string;
    nombre: string;
    apellidos: string;
    password: string;
    rol?: Rol;
}

export interface UsuarioUpdateDto {
    email?: string;
    nombre?: string;
    apellidos?: string;
    password?: string;
    rol?: Rol;
    estado?: EstadoUsuario;
} */
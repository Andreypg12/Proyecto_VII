import { CategoriaServicio } from "./categoriaServicio.model";
import { Profesional } from "./profesional.model";

export type Modalidad = 'PRESENCIAL' | 'VIRTUAL' | 'HÍBRIDA';

export interface Servicio {
    id: number;
    servicio: string;
    descripcion: string;
    precio: number;
    duracion_estimada: number;
    estado: boolean;
    modalidad: Modalidad;
    profesional: Profesional;
    categoria: CategoriaServicio;
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
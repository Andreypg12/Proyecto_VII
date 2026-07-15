import { CategoriaServicio } from "./categoriaServicio.model";
import { Especialidad } from "./especialidad.model";
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

    id_profesional: number;
    profesional: Profesional;

    id_categoria: number;
    categoria?: CategoriaServicio;

    especialidades: Especialidad[];
}

export interface ServicioFormModel {
    servicio: string;
    descripcion: string;
    precio: number;
    duracion_estimada: number;
    estado: boolean;
    modalidad: Modalidad;
    profesional_id: number | null;
    categoria_id: number | null;
    especialidades_Ids: number[];
}

export interface ServicioCreateDto {
    servicio: string;
    descripcion: string;
    precio: number;
    duracion_estimada: number;
    estado: boolean;
    modalidad: Modalidad;
    profesional_id: number;
    categoria_id: number;
    especialidades_Ids: number[];
}

export interface ServicioUpdateDto {
    servicio?: string;
    descripcion?: string;
    precio?: number;
    duracion_estimada?: number;
    estado?: boolean;
    modalidad?: Modalidad;
    categoria_id?: number;
    especialidades_Ids?: number[];
} 
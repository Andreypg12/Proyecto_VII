import { Especialidad } from "./especialidad.model";
import { Servicio } from "./servicio.model";
import { UbicacionProfesional } from "./ubicacionProfesional.model";
import { Usuario } from "./usuario.model";

export type Modalidad = 'PRESENCIAL' | 'VIRTUAL' | 'HÍBRIDA';

export interface Profesional {
    id: number;
    titulo: string;
    descripcion: string;
    tarifa_por_hora: number;
    annos_experiencia: number;
    imagen_profesional: string;
    disponibilidad: boolean;
    telefono: string;
    modalidad: Modalidad;

    id_usuario: number;
    usuario?: Usuario;

    servicios?: Servicio[];
    ubicaciones?: UbicacionProfesional[];
    especialidades?: Especialidad[];
}

export interface ProfesionalFormModel {
    titulo: string;
    descripcion: string;
    tarifa_por_hora: number;
    annos_experiencia: number;
    imagen_profesional: string;
    disponibilidad: boolean;
    telefono: string;
    modalidad: Modalidad;

    // Datos de usuario
    email: string;
    nombre: string;
    apellidos: string;
    password: string;

    // Datos de ubicación

    ciudad: string;
    canton: string;
    distrito: string;
    descripcionUbicacion: string;
    id_distrito: number;

    provinciaSeleccionada: number | null;
    cantonSeleccionado: number | null;
    distritoSeleccionado: number | null;

    // Relaciones
    especialidades_Ids: number[];
}

export interface ProfesionalCreateDto {
    titulo: string;
    descripcion: string;
    tarifa_por_hora: number;
    annos_experiencia: number;
    imagen_profesional: string;
    disponibilidad: boolean;
    telefono: string;
    modalidad: Modalidad;

    // El backend espera un objeto usuario completo
    usuario: {
        email: string;
        nombre: string;
        apellidos: string;
        password: string;
    };

    // El backend espera un objeto ubicacion
    ubicacion: {
        descripcion: string;
        id_distrito: number;
        distrito: string;
        canton: string;
        ciudad: string;
    };

    especialidades_Ids: number[];
}

export interface ProfesionalUpdateDto {
    titulo?: string;
    descripcion?: string;
    tarifa_por_hora?: number;
    annos_experiencia?: number;
    imagen_profesional?: string;
    disponibilidad?: boolean;
    telefono?: string;
    modalidad?: Modalidad;

    usuario?: {
        email?: string;
        nombre?: string;
        apellidos?: string;
        password?: string;
    };

    ubicacion?: {
        descripcion?: string;
        id_distrito?: number;
        distrito?: string;
        canton?: string;
        ciudad?: string;
    };

    especialidades_Ids?: number[];
}
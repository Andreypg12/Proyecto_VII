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
    Modalidad: Modalidad;

    usuario?: Usuario;
    servicios?: Servicio[];
    ubicaciones?: UbicacionProfesional[];

}

// export interface UsuarioCreateDto {
//     email: string;
//     nombre: string;
//     apellidos: string;
//     password: string;
//     rol?: Rol;
// }

// export interface UsuarioUpdateDto {
//     email?: string;
//     nombre?: string;
//     apellidos?: string;
//     password?: string;
//     rol?: Rol;
//     estado?: EstadoUsuario;
// }
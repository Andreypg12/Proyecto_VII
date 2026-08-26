export type EstadoCita = string;
export type Modalidad = string;

export interface ValoracionCita {
    id: number;
    puntuacion: number;
    comentario: string;
    createdAt: string;
    cliente?: {
        id: number;
        nombre: string;
        apellidos: string;
    };
}

export interface ConfiguracionCita {
    modalidades: Modalidad[];
    estados: EstadoCita[];
}

export interface ClienteCita {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
}

export interface UsuarioProfesionalCita {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    estado?: string;
}

export interface ProfesionalCita {
    id: number;
    titulo: string;
    descripcion?: string;
    tarifa_por_hora?: string | number;
    disponibilidad?: boolean;
    telefono?: string;
    usuario: UsuarioProfesionalCita;
}

export interface ServicioCita {
    id: number;
    servicio: string;
    descripcion?: string | null;
    precio: string | number;
    duracion_estimada: number;
    modalidad: Modalidad;
    estado?: boolean;
    id_profesional?: number;
}

export interface Cita {
    id: number;

    fecha_hora_inicio: string;
    fecha_hora_finalizacion_esperada: string;
    fecha_hora_finalizacion_real: string | null;

    comentario_cliente: string | null;
    comentario_profesional: string | null;
    monto_estimado: string | number;

    modalidad: Modalidad;
    estado: EstadoCita;

    cliente: ClienteCita;
    profesional: ProfesionalCita;
    servicio: ServicioCita;

    valoracion?: ValoracionCita[] | null;

    createdAt?: string;
    updateAt?: string;
}

export interface FiltrosCita {
    estado?: EstadoCita | '';
    idProfesional?: number | null;
    fechaDesde?: string;
    fechaHasta?: string;
}

export interface CitaFormModel {
    id_cliente: number | null;
    id_profesional: number | null;
    id_servicio: number | null;

    fecha: string;
    hora: string | null;

    modalidad: Modalidad | null;
    comentario_cliente: string;
}

export interface CreateCitaDto {
    id_cliente: number;
    id_profesional: number;
    id_servicio: number;

    fecha_hora_inicio: string;
    modalidad: Modalidad;

    comentario_cliente?: string | null;
}
export interface CambiarEstadoCitaDto {
    estado: EstadoCita;
    comentario_profesional?: string | null;
}

export interface ResultadoCambioEstadoCita {
    id: number;
    estado: EstadoCita;
    comentario_profesional: string | null;
    fecha_hora_finalizacion_real: string | null;
    updateAt: string;
}

export interface HistorialCita {
    id: number;
    estado_anterior: EstadoCita;
    estado_nuevo: EstadoCita;
    comentario: string | null;
    realizado_por: string;
    fecha_cambio: string;
    id_usuario: number | null;
    cliente: ClienteCita;
    profesional: { usuario: UsuarioProfesionalCita };
    servicio: { servicio: string };
    usuario?: { id: number; email: string; nombre: string; apellidos: string };
}

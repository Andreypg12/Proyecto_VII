export type EstadoCita =
    | 'PENDIENTE'
    | 'ACEPTADA'
    | 'RECHAZADA'
    | 'CANCELADA'
    | 'COMPLETADA';

export type Modalidad =
    | 'PRESENCIAL'
    | 'VIRTUAL'
    | 'HÍBRIDA';

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
    monto_estimado: string | number;

    modalidad: Modalidad;
    estado: EstadoCita;

    cliente: ClienteCita;
    profesional: ProfesionalCita;
    servicio: ServicioCita;

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

    fecha_hora_inicio: string;
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
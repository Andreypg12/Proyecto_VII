export interface Valoracion {
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

export interface CreateValoracionDto {
    puntuacion: number;
    comentario: string;
    id_profesional: number;
    id_cliente: number;
    id_cita: number;
}

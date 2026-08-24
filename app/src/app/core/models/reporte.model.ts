export interface ReporteCitasEstadoItem {
    estado: string;
    cantidad: number;
    porcentaje: number;
}

export interface ReporteCitasEstado {
    totalGeneral: number;
    estados: ReporteCitasEstadoItem[];
}

export interface FiltrosReporteCitasEstado {
    fechaDesde?: string;
    fechaHasta?: string;
    idProfesional?: number;
    idCategoria?: number;
}

// Reporte 2
// Citas por Profesional

export interface ReporteCitasProfesional {
    idProfesional: number;
    profesional: string;
    totalCitas: number;
    citasCompletadas: number;
    porcentajeFinalizacion: number;
}

// REPORTE 3
// CALIFICACIONES
export interface ServicioCalificacionReporte {
    servicio: string;
    promedio: number;
}

export interface ReporteCalificaciones {
    idProfesional: number;
    profesional: string;

    promedioCalificacion: number;
    cantidadResenas: number;

    mejoresServicios: ServicioCalificacionReporte[];

    serviciosBajaCalificacion:
        ServicioCalificacionReporte[];

    umbralBajaCalificacion: number;
}
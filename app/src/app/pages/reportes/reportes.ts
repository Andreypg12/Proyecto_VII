import { Component, inject, signal } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule
} from '@angular/forms';

import { ReporteService } from '../../core/services/reporte.service';
import { ProfesionalService } from '../../core/services/profesional.service';
import { CategoriaServicioService } from '../../core/services/categoria-servicio.service';

import {
    FiltrosReporteCitasEstado,
    ReporteCitasEstado,
    ReporteCitasProfesional,
    ReporteCalificaciones
} from '../../core/models/reporte.model';

import { Profesional } from '../../core/models/profesional.model';
import { CategoriaServicio } from '../../core/models/categoriaServicio.model';

import { PdfService } from '../../core/services/pdf.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-reportes',
    imports: [
        ReactiveFormsModule
    ],
    templateUrl: './reportes.html',
    styleUrl: './reportes.css'
})
export class Reportes {

    private authService = inject(AuthService);
    private pdfService = inject(PdfService);
    private reporteService = inject(ReporteService);
    private profesionalService = inject(ProfesionalService);
    private categoriaServicioService = inject(CategoriaServicioService);


    // DATOS DEL REPORTE

    reporteSeleccionado = signal< 'estado' | 'profesional' | 'calificaciones' >('estado');

    //Reporte 1
    reporte = signal<ReporteCitasEstado | null>(null);
    profesionales = signal<Profesional[]>([]);
    categorias = signal<CategoriaServicio[]>([]);
    cargando = signal(false);
    cargandoFiltros = signal(false);
    error = signal<string | null>(null);

    //reporte 2
    reporteProfesional = signal<ReporteCitasProfesional[]>([]);
    cargandoReporteProfesional = signal(false);
    errorReporteProfesional = signal<string | null>(null);

    //Reporte 3
    reporteCalificaciones = signal<ReporteCalificaciones[]>([]);
    cargandoReporteCalificaciones = signal(false);
    errorReporteCalificaciones = signal<string | null>(null);


    // FORMULARIO

    filtrosForm = new FormGroup({
        fechaDesde: new FormControl<string>(''),
        fechaHasta: new FormControl<string>(''),
        idProfesional: new FormControl<string>(''),
        idCategoria: new FormControl<string>('')
    });

    constructor() {
        this.cargarOpcionesFiltros();
        this.cargarReporte();
    }

    seleccionarReporte( reporte: 'estado' | 'profesional' |'calificaciones'): void {

        this.reporteSeleccionado.set( reporte );


        if ( reporte === 'profesional' && this.reporteProfesional().length === 0) {
            this.cargarReporteProfesional();
        }


        if ( reporte === 'calificaciones' && this.reporteCalificaciones().length === 0) {
            this.cargarReporteCalificaciones();
        }
    }


    //Reporte 1
    // CARGAR PROFESIONALES Y CATEGORÍAS
    cargarOpcionesFiltros(): void {

        this.cargandoFiltros.set(true);

        this.profesionalService
            .listar()
            .subscribe({

                next: (response) => {

                    this.profesionales.set(
                        response.data
                    );
                },

                error: (error) => {

                    console.error(
                        'Error cargando profesionales:',
                        error
                    );
                }

            });


        this.categoriaServicioService
            .listar(undefined, true)
            .subscribe({

                next: (response) => {

                    this.categorias.set(
                        response.data
                    );

                    this.cargandoFiltros.set(false);
                },

                error: (error) => {

                    console.error(
                        'Error cargando categorías:',
                        error
                    );

                    this.cargandoFiltros.set(false);
                }

            });
    }

    //Reporte 2
    cargarReporteProfesional(): void {

    this.cargandoReporteProfesional.set(true);
    this.errorReporteProfesional.set(null);

    const usuarioActual =
        this.authService.usuario();

    if (!usuarioActual) {

        this.errorReporteProfesional.set(
            'No existe un usuario autenticado'
        );

        this.cargandoReporteProfesional.set(false);

        return;
    }

    // ADMINISTRADOR
    // Puede consultar todos

    if (usuarioActual.rol === 'ADMINISTRADOR') {

        this.consultarReporteProfesional();

        return;
    }


    // PROFESIONAL
    // Primero obtenemos su perfil profesional

    if (usuarioActual.rol === 'PROFESIONAL') {

        this.profesionalService
            .listar()
            .subscribe({

                next: (response) => {

                    const profesionalActual =
                        response.data.find(
                            profesional =>
                                Number(
                                    profesional.id_usuario ??
                                    profesional.usuario?.id
                                ) === Number(usuarioActual.id)
                        );


                    if (!profesionalActual) {

                        this.errorReporteProfesional.set(
                            'No se encontró el perfil profesional del usuario autenticado'
                        );

                        this.cargandoReporteProfesional.set(false);

                        return;
                    }


                    this.consultarReporteProfesional(
                        profesionalActual.id
                    );
                },


                error: (error) => {

                    console.error(
                        'Error obteniendo el perfil profesional:',
                        error
                    );

                    this.errorReporteProfesional.set(
                        'No fue posible obtener el perfil profesional'
                    );

                    this.cargandoReporteProfesional.set(false);
                }

            });

        return;
    }


        // OTRO ROL

        this.errorReporteProfesional.set(
            'No tiene permisos para consultar este reporte'
        );

        this.cargandoReporteProfesional.set(false);
    }

    private consultarReporteProfesional( idProfesional?: number ): void {

        this.reporteService
            .obtenerCitasPorProfesional(
                idProfesional
            )
            .subscribe({

                next: (response) => {
                    this.reporteProfesional.set( response.data);
                    this.cargandoReporteProfesional.set(false);
                },

                error: (error) => {
                    console.error(
                        'Error cargando reporte por profesional:',
                        error
                    );

                    this.errorReporteProfesional.set(
                        error?.error?.message ??
                        'No fue posible cargar el reporte por profesional'
                    );
                    this.cargandoReporteProfesional.set(false);
                }
            });
    }

    

    //Reporte 3
    cargarReporteCalificaciones(): void {

        this.cargandoReporteCalificaciones.set(
            true
        );

        this.errorReporteCalificaciones.set(
            null
        );


        const usuarioActual =
            this.authService.usuario();


        if (!usuarioActual) {

            this.errorReporteCalificaciones.set(
                'No existe un usuario autenticado'
            );

            this.cargandoReporteCalificaciones.set(
                false
            );

            return;
        }


        // ==========================================
        // ADMINISTRADOR
        // ==========================================

        if (
            usuarioActual.rol ===
            'ADMINISTRADOR'
        ) {

            this.consultarReporteCalificaciones();

            return;
        }


        // ==========================================
        // PROFESIONAL
        // ==========================================

        if (
            usuarioActual.rol ===
            'PROFESIONAL'
        ) {

            this.profesionalService
                .listar()
                .subscribe({

                    next: (response) => {

                        const profesionalActual =
                            response.data.find(
                                profesional =>
                                    Number(
                                        profesional.id_usuario ??
                                        profesional.usuario?.id
                                    ) ===
                                    Number(
                                        usuarioActual.id
                                    )
                            );


                        if (!profesionalActual) {

                            this.errorReporteCalificaciones.set(
                                'No se encontró el perfil profesional del usuario autenticado'
                            );

                            this.cargandoReporteCalificaciones.set(
                                false
                            );

                            return;
                        }


                        this.consultarReporteCalificaciones(
                            profesionalActual.id
                        );
                    },


                    error: (error) => {

                        console.error(
                            'Error obteniendo el perfil profesional:',
                            error
                        );

                        this.errorReporteCalificaciones.set(
                            'No fue posible obtener el perfil profesional'
                        );

                        this.cargandoReporteCalificaciones.set(
                            false
                        );
                    }

                });

            return;
        }


        this.errorReporteCalificaciones.set(
            'No tiene permisos para consultar este reporte'
        );

        this.cargandoReporteCalificaciones.set(
            false
        );
    }

    private consultarReporteCalificaciones( idProfesional?: number): void {

        this.reporteService.obtenerCalificaciones(idProfesional)
            .subscribe({

                next: (response) => {
                    this.reporteCalificaciones.set(
                        response.data
                    );
                    this.cargandoReporteCalificaciones.set(
                        false
                    );
                },

                error: (error) => {

                    console.error(
                        'Error cargando reporte de calificaciones:',
                        error
                    );

                    this.errorReporteCalificaciones.set(
                        error?.error?.message ??
                        'No fue posible cargar el reporte de calificaciones'
                    );

                    this.cargandoReporteCalificaciones.set(
                        false
                    );
                }

            });
    }


    // CARGAR REPORTE
    cargarReporte(): void {
        this.cargando.set(true);
        this.error.set(null);
        const usuarioActual = this.authService.usuario();


        if (!usuarioActual) {
            this.error.set( 'No existe un usuario autenticado' );
            this.cargando.set(false);
            return;
        }

        const valores = this.filtrosForm.getRawValue();

        const filtros: FiltrosReporteCitasEstado = {};


        // Fecha desde
        if (valores.fechaDesde) {
            filtros.fechaDesde = valores.fechaDesde;
        }

        // Fecha hasta
        if (valores.fechaHasta) {
            filtros.fechaHasta = valores.fechaHasta;
        }

        // Categoría
        if (valores.idCategoria) {

            filtros.idCategoria =
                Number(
                    valores.idCategoria
                );

        }

        if ( usuarioActual.rol === 'ADMINISTRADOR' ) {

            if (valores.idProfesional) {
                filtros.idProfesional = Number( valores.idProfesional );
            }

            this.consultarReporteEstado( filtros );
            return;
        }

        if ( usuarioActual.rol === 'PROFESIONAL' ) {

            this.profesionalService
                .listar()
                .subscribe({

                    next: (response) => {

                        const profesionalActual =
                            response.data.find(
                                profesional =>
                                    Number(
                                        profesional.id_usuario ??
                                        profesional.usuario?.id
                                    ) ===
                                    Number(
                                        usuarioActual.id
                                    )
                            );


                        if (!profesionalActual) {

                            this.error.set( 'No se encontró el perfil profesional del usuario autenticado' );
                            this.cargando.set(false);
                            return;
                        }


                        // Forzamos el ID del profesional autenticado.
                        // No dependemos de lo seleccionado en el formulario.
                        filtros.idProfesional = profesionalActual.id;

                        // Se guarda también el ID en el formulario.
                        this.filtrosForm.patchValue(
                            {
                                idProfesional:
                                    profesionalActual.id.toString()
                            }, { emitEvent: false}
                        );


                        this.consultarReporteEstado(filtros );
                    },


                    error: (error) => {
                        console.error( 'Error obteniendo el perfil profesional:', error );
                        this.error.set( 'No fue posible obtener el perfil profesional' );
                        this.cargando.set(false);
                    }
                });

            return;
        }

        this.error.set(
            'No tiene permisos para consultar este reporte'
        );

        this.cargando.set(false);

    }

    private consultarReporteEstado( filtros: FiltrosReporteCitasEstado ): void {

        this.reporteService
            .obtenerCitasPorEstado(
                filtros
            )
            .subscribe({

                next: (response) => {

                    this.reporte.set(
                        response.data
                    );

                    this.cargando.set(false);

                },


                error: (error) => {

                    console.error(
                        'Error al obtener el reporte:',
                        error
                    );

                    this.error.set(
                        error?.error?.message ??
                        'No fue posible cargar el reporte'
                    );

                    this.cargando.set(false);

                }

            });

    }


    // LIMPIAR FILTROS

    limpiarFiltros(): void {

        this.filtrosForm.reset({

            fechaDesde: '',

            fechaHasta: '',

            idProfesional: '',

            idCategoria: ''

        });

        this.cargarReporte();
    }


    //Reporte 1
    descargarPdf(): void {

        const datos = this.reporte();

        if (!datos) {
            return;
        }
        const valores = this.filtrosForm.getRawValue();
        let nombreProfesional = 'Todos los profesionales';
        let nombreCategoria = 'Todas las categorías';


        // Profesional seleccionado
        if (valores.idProfesional) {

            const profesional =
                this.profesionales().find(
                    item =>
                        item.id ===
                        Number(
                            valores.idProfesional
                        )
                );

            if (profesional) {

                nombreProfesional =
                    `${profesional.usuario.nombre} ${profesional.usuario.apellidos}`;
            }
        }

        // Categoría seleccionada
        if (valores.idCategoria) {

            const categoria =
                this.categorias().find(
                    item =>
                        item.id ===
                        Number(
                            valores.idCategoria
                        )
                );

            if (categoria) {
                nombreCategoria = categoria.categoria;
            }
        }

        this.pdfService
            .generarReporteCitasPorEstado(
                datos,
                {
                    fechaDesde:
                        valores.fechaDesde || undefined,

                    fechaHasta:
                        valores.fechaHasta || undefined,

                    profesional:
                        nombreProfesional,

                    categoria:
                        nombreCategoria
                }
            );
    }

    //Reporte 2
    async descargarPdfProfesional(): Promise<void> {

        const datos =
            this.reporteProfesional();

        if (
            !datos ||
            datos.length === 0
        ) {
            return;
        }

        await this.pdfService
            .generarReporteCitasPorProfesional(
                datos
            );
    }

    //Reporte 3
    async descargarPdfCalificaciones(): Promise<void> {

        const datos =
            this.reporteCalificaciones();

        if (
            !datos ||
            datos.length === 0
        ) {
            return;
        }

        await this.pdfService
            .generarReporteCalificaciones(
                datos
            );
    }

}
import { Injectable } from '@angular/core';

import type {
    Content,
    TDocumentDefinitions
} from 'pdfmake/interfaces';

import {
    ReporteCitasEstado,
    ReporteCitasProfesional,
    ReporteCalificaciones
} from '../models/reporte.model';


export interface FiltrosPdfCitasEstado {

    fechaDesde?: string;
    fechaHasta?: string;
    profesional?: string;
    categoria?: string;
}


@Injectable({
    providedIn: 'root'
})
export class PdfService {

    //Repote 1
    async generarReporteCitasPorEstado(reporte: ReporteCitasEstado, filtros: FiltrosPdfCitasEstado): Promise<void> {

        // PDFMake se carga únicamente
        // cuando el usuario genera el PDF.
        const pdfMakeModule =
            await import('pdfmake/build/pdfmake');

        const pdfFontsModule =
            await import('pdfmake/build/vfs_fonts');


        const pdfMake: any =
            (pdfMakeModule as any).default
            ?? pdfMakeModule;

        const pdfFonts: any =
            (pdfFontsModule as any).default
            ?? pdfFontsModule;


        // Configurar las fuentes virtuales.
        if (
            typeof pdfMake.addVirtualFileSystem
            === 'function'
        ) {

            pdfMake.addVirtualFileSystem(
                pdfFonts
            );

        } else {

            pdfMake.vfs =
                pdfFonts?.pdfMake?.vfs
                ?? pdfFonts?.vfs
                ?? pdfFonts;
        }


        const fechaGeneracion =
            new Date().toLocaleString(
                'es-CR'
            );


        const periodo =
            this.obtenerPeriodo(
                filtros.fechaDesde,
                filtros.fechaHasta
            );


        const filasEstados =
            reporte.estados.map(
                item => [

                    item.estado,

                    item.cantidad.toString(),

                    `${item.porcentaje}%`

                ]
            );


        const documento:
            TDocumentDefinitions = {

            pageSize: 'A4',

            pageMargins: [
                40,
                50,
                40,
                50
            ],


            info: {

                title:
                    'Reporte de citas por estado',

                author:
                    'TechHire',

                subject:
                    'Reporte de citas por estado'

            },


            content: [

                this.construirEncabezado(
                    'Reporte de citas por estado',
                    'Resumen de las citas registradas según su estado actual.',
                    'CITAS · ESTADO',
                    fechaGeneracion
                ),


                {
                    margin: [
                        0,
                        22,
                        0,
                        8
                    ],

                    table: {

                        widths: [
                            'auto',
                            '*'
                        ],

                        body: [

                            [
                                {
                                    text: 'Periodo:',
                                    bold: true
                                },

                                periodo
                            ],

                            [
                                {
                                    text:
                                        'Profesional:',

                                    bold: true
                                },

                                filtros.profesional
                                ?? 'Todos los profesionales'
                            ],

                            [
                                {
                                    text:
                                        'Categoría:',

                                    bold: true
                                },

                                filtros.categoria
                                ?? 'Todas las categorías'
                            ]

                        ]
                    },

                    layout: 'noBorders'
                },


                {
                    margin: [
                        0,
                        18,
                        0,
                        6
                    ],

                    text:
                        'Total general',

                    style: 'seccion'
                },


                {
                    text:
                        reporte
                            .totalGeneral
                            .toString(),

                    style: 'total'
                },


                {
                    text:
                        'citas registradas',

                    alignment:
                        'center',

                    margin: [
                        0,
                        0,
                        0,
                        20
                    ],

                    color:
                        '#64748b'
                },


                {
                    text:
                        'Distribución por estado',

                    style:
                        'seccion',

                    margin: [
                        0,
                        0,
                        0,
                        10
                    ]
                },


                {
                    table: {

                        headerRows: 1,

                        widths: [
                            '*',
                            'auto',
                            'auto'
                        ],

                        body: [

                            [
                                {
                                    text: 'Estado',
                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text: 'Cantidad',
                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Porcentaje',

                                    style:
                                        'tablaHeader'
                                }
                            ],

                            ...filasEstados
                        ]

                    },

                    layout: {

                        fillColor:
                            (
                                rowIndex:
                                    number
                            ) => {

                                if (
                                    rowIndex === 0
                                ) {

                                    return '#E7F8FC';
                                }

                                return (
                                    rowIndex % 2 === 0
                                )
                                    ? '#F8FAFC'
                                    : null;
                            },

                        hLineColor:
                            () =>
                                '#D7E1E8',

                        vLineColor:
                            () =>
                                '#D7E1E8'
                    }
                }

            ],


            styles: {

                marca: {

                    fontSize: 10,

                    bold: true,

                    color:
                        '#087F8C',

                    characterSpacing:
                        1.5
                },


                titulo: {

                    fontSize: 22,

                    bold: true,

                    color:
                        '#183044',

                    margin: [
                        0,
                        5,
                        0,
                        4
                    ]
                },


                subtitulo: {

                    fontSize: 10,

                    color:
                        '#64748b'
                },


                etiqueta: {

                    fontSize: 9,

                    bold: true,

                    color:
                        '#087F8C',

                    characterSpacing:
                        1
                },


                seccion: {

                    fontSize: 12,

                    bold: true,

                    color:
                        '#183044'
                },


                total: {

                    fontSize: 34,

                    bold: true,

                    alignment:
                        'center',

                    color:
                        '#183044'
                },


                tablaHeader: {

                    bold: true,

                    fontSize: 10,

                    color:
                        '#183044'
                }
            },


            defaultStyle: {

                fontSize: 10
            }

        };


        pdfMake
            .createPdf(documento)
            .download(
                'reporte-citas-por-estado.pdf'
            );
    }


    //Reporte 2
    async generarReporteCitasPorProfesional(datos: ReporteCitasProfesional[]): Promise<void> {

        const pdfMakeModule =
            await import('pdfmake/build/pdfmake');

        const pdfFontsModule =
            await import('pdfmake/build/vfs_fonts');

        const pdfMake: any =
            (pdfMakeModule as any).default
            ?? pdfMakeModule;

        const pdfFonts: any =
            (pdfFontsModule as any).default
            ?? pdfFontsModule;

        if (
            typeof pdfMake.addVirtualFileSystem
            === 'function'
        ) {
            pdfMake.addVirtualFileSystem(
                pdfFonts
            );
        } else {
            pdfMake.vfs =
                pdfFonts?.pdfMake?.vfs
                ?? pdfFonts?.vfs
                ?? pdfFonts;
        }


        const fechaGeneracion =
            new Date().toLocaleString('es-CR');


        const filas =
            datos.map(item => [
                item.profesional,
                item.totalCitas.toString(),
                item.citasCompletadas.toString(),
                `${item.porcentajeFinalizacion}%`
            ]);


        const documento: TDocumentDefinitions = {

            pageSize: 'A4',

            pageMargins: [
                40,
                50,
                40,
                50
            ],

            info: {
                title:
                    'Reporte de citas por profesional',

                author:
                    'TechHire',

                subject:
                    'Reporte de citas por profesional'
            },

            content: [

                this.construirEncabezado(
                    'Reporte de citas por profesional',
                    'Resumen de citas registradas, completadas y porcentaje de finalización por profesional.',
                    'CITAS · PROFESIONAL',
                    fechaGeneracion
                ),

                {
                    text:
                        'Rendimiento por profesional',
                    style: 'seccion',
                    margin: [
                        0,
                        4,
                        0,
                        10
                    ]
                },

                {
                    table: {

                        headerRows: 1,

                        widths: [
                            '*',
                            'auto',
                            'auto',
                            'auto'
                        ],

                        body: [

                            [
                                {
                                    text:
                                        'Profesional',
                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Total de citas',
                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Completadas',
                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Finalización',
                                    style:
                                        'tablaHeader'
                                }
                            ],

                            ...filas
                        ]
                    },

                    layout: {

                        fillColor:
                            (
                                rowIndex:
                                    number
                            ) => {

                                if (
                                    rowIndex === 0
                                ) {
                                    return '#E7F8FC';
                                }

                                return (
                                    rowIndex % 2 === 0
                                )
                                    ? '#F8FAFC'
                                    : null;
                            },

                        hLineColor:
                            () => '#D7E1E8',

                        vLineColor:
                            () => '#D7E1E8'
                    }
                }

            ],

            styles: {

                marca: {
                    fontSize: 10,
                    bold: true,
                    color: '#087F8C',
                    characterSpacing: 1.5
                },

                titulo: {
                    fontSize: 22,
                    bold: true,
                    color: '#183044',
                    margin: [
                        0,
                        5,
                        0,
                        4
                    ]
                },

                subtitulo: {
                    fontSize: 10,
                    color: '#64748b'
                },

                etiqueta: {
                    fontSize: 9,
                    bold: true,
                    color: '#087F8C',
                    characterSpacing: 1
                },

                seccion: {
                    fontSize: 12,
                    bold: true,
                    color: '#183044'
                },

                tablaHeader: {
                    bold: true,
                    fontSize: 10,
                    color: '#183044'
                }
            },

            defaultStyle: {
                fontSize: 10
            }
        };


        pdfMake
            .createPdf(documento)
            .download(
                'reporte-citas-por-profesional.pdf'
            );
    }


    //Reporte 3
    async generarReporteCalificaciones( datos: ReporteCalificaciones[] ): Promise<void> {

        const pdfMakeModule =
            await import('pdfmake/build/pdfmake');

        const pdfFontsModule =
            await import('pdfmake/build/vfs_fonts');


        const pdfMake: any =
            (pdfMakeModule as any).default
            ?? pdfMakeModule;

        const pdfFonts: any =
            (pdfFontsModule as any).default
            ?? pdfFontsModule;


        if (
            typeof pdfMake.addVirtualFileSystem
            === 'function'
        ) {

            pdfMake.addVirtualFileSystem(
                pdfFonts
            );

        } else {

            pdfMake.vfs =
                pdfFonts?.pdfMake?.vfs
                ?? pdfFonts?.vfs
                ?? pdfFonts;
        }


        const fechaGeneracion =
            new Date().toLocaleString(
                'es-CR'
            );


        const umbral =
            datos.length > 0
                ? datos[0].umbralBajaCalificacion
                : 3;


        const filas =
            datos.map(item => {

                const promedio =
                    item.cantidadResenas > 0
                        ? `${item.promedioCalificacion}/5`
                        : 'Sin calificaciones';


                const mejoresServicios =
                    item.mejoresServicios.length > 0
                        ? item.mejoresServicios
                            .map(
                                servicio =>
                                    `${servicio.servicio} (${servicio.promedio}/5)`
                            )
                            .join('\n')
                        : 'Sin datos';


                const serviciosBajos =
                    item.serviciosBajaCalificacion.length > 0
                        ? item.serviciosBajaCalificacion
                            .map(
                                servicio =>
                                    `${servicio.servicio} (${servicio.promedio}/5)`
                            )
                            .join('\n')
                        : 'Ninguno';


                return [
                    item.profesional,
                    promedio,
                    item.cantidadResenas.toString(),
                    mejoresServicios,
                    serviciosBajos
                ];
            });


        const documento: TDocumentDefinitions = {

            pageSize: 'A4',

            pageOrientation: 'landscape',

            pageMargins: [
                35,
                45,
                35,
                45
            ],


            info: {

                title:
                    'Reporte de calificaciones',

                author:
                    'TechHire',

                subject:
                    'Reporte de calificaciones de profesionales'
            },


            content: [

                this.construirEncabezado(
                    'Reporte de calificaciones',
                    'Resumen de calificaciones, reseñas y rendimiento de los servicios profesionales.',
                    'CALIFICACIONES',
                    fechaGeneracion
                ),


                {
                    text:
                        'Rendimiento de calificaciones',

                    style: 'seccion',

                    margin: [
                        0,
                        4,
                        0,
                        10
                    ]
                },


                {
                    table: {

                        headerRows: 1,

                        widths: [
                            120,
                            75,
                            55,
                            '*',
                            '*'
                        ],

                        body: [

                            [
                                {
                                    text:
                                        'Profesional',

                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Promedio',

                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Reseñas',

                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Mejor servicio',

                                    style:
                                        'tablaHeader'
                                },

                                {
                                    text:
                                        'Baja calificación',

                                    style:
                                        'tablaHeader'
                                }
                            ],

                            ...filas
                        ]
                    },


                    layout: {

                        fillColor:
                            (
                                rowIndex:
                                    number
                            ) => {

                                if (
                                    rowIndex === 0
                                ) {
                                    return '#E7F8FC';
                                }

                                return (
                                    rowIndex % 2 === 0
                                )
                                    ? '#F8FAFC'
                                    : null;
                            },

                        hLineColor:
                            () =>
                                '#D7E1E8',

                        vLineColor:
                            () =>
                                '#D7E1E8'
                    }
                },


                {
                    margin: [
                        0,
                        18,
                        0,
                        0
                    ],

                    text: [
                        {
                            text:
                                'Criterio de baja calificación: ',

                            bold: true
                        },

                        `promedio inferior a ${umbral}/5.`
                    ],

                    fontSize: 9,

                    color:
                        '#64748b'
                }

            ],


            styles: {

                marca: {

                    fontSize: 10,

                    bold: true,

                    color:
                        '#087F8C',

                    characterSpacing:
                        1.5
                },


                titulo: {

                    fontSize: 22,

                    bold: true,

                    color:
                        '#183044',

                    margin: [
                        0,
                        5,
                        0,
                        4
                    ]
                },


                subtitulo: {

                    fontSize: 10,

                    color:
                        '#64748b'
                },


                etiqueta: {

                    fontSize: 9,

                    bold: true,

                    color:
                        '#087F8C',

                    characterSpacing:
                        1
                },


                seccion: {

                    fontSize: 12,

                    bold: true,

                    color:
                        '#183044'
                },


                tablaHeader: {

                    bold: true,

                    fontSize: 9,

                    color:
                        '#183044'
                }
            },


            defaultStyle: {

                fontSize: 9
            }
        };


        pdfMake
            .createPdf(documento)
            .download(
                'reporte-calificaciones.pdf'
            );
    }


    /**
     * Construye el encabezado compartido de los 3 reportes:
     * marca + título + subtítulo a la izquierda, etiqueta del
     * tipo de reporte y fecha de generación a la derecha, con
     * una línea de acento debajo.
     */
    private construirEncabezado(
        titulo: string,
        subtitulo: string,
        etiqueta: string,
        fechaGeneracion: string
    ): Content {

        return {
            stack: [

                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'TECHHIRE', style: 'marca' },
                                { text: titulo, style: 'titulo' },
                                { text: subtitulo, style: 'subtitulo' }
                            ]
                        },
                        {
                            width: 'auto',
                            stack: [
                                {
                                    text: etiqueta,
                                    style: 'etiqueta',
                                    alignment: 'right'
                                },
                                {
                                    text: fechaGeneracion,
                                    fontSize: 8,
                                    color: '#94a3b8',
                                    alignment: 'right',
                                    margin: [0, 4, 0, 0]
                                }
                            ]
                        }
                    ]
                },

                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0, y1: 0,
                            x2: 515, y2: 0,
                            lineWidth: 1.5,
                            lineColor: '#087F8C'
                        }
                    ],
                    margin: [0, 12, 0, 18]
                }

            ]
        };
    }


    private obtenerPeriodo(
        fechaDesde?: string,
        fechaHasta?: string
    ): string {

        if (
            fechaDesde &&
            fechaHasta
        ) {

            return (
                `${this.formatearFecha(fechaDesde)} - ` +
                `${this.formatearFecha(fechaHasta)}`
            );
        }


        if (fechaDesde) {

            return (
                `Desde ${this.formatearFecha(
                    fechaDesde
                )
                }`
            );
        }


        if (fechaHasta) {

            return (
                `Hasta ${this.formatearFecha(
                    fechaHasta
                )
                }`
            );
        }


        return 'Todo el periodo';
    }


    private formatearFecha(
        fecha: string
    ): string {

        const [
            year,
            month,
            day
        ] = fecha.split('-');


        return (
            `${day}/${month}/${year}`
        );
    }
}
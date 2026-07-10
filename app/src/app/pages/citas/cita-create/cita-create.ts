import {
    Component,
    OnInit,
    signal
} from '@angular/core';

import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CitaForm } from
    '../../../shared/components/cita-form/cita-form';

import {
    CreateCitaDto, Modalidad
} from '../../../core/models/cita.model';

import {
    Usuario
} from '../../../core/models/usuario.model';

import {
    Profesional
} from '../../../core/models/profesional.model';

import {
    Servicio
} from '../../../core/models/servicio.model';

import {
    UsuarioService
} from '../../../core/services/usuarios.service';

import {
    ProfesionalService
} from '../../../core/services/profesional.service';

import {
    ServicioService
} from '../../../core/services/servicio.service';

import {
    CitaService
} from '../../../core/services/cita.service';

import {
    NotificationService
} from '../../../core/services/notification.service';

@Component({
    selector: 'app-cita-create',
    standalone: true,
    imports: [
        CitaForm
    ],
    templateUrl: './cita-create.html',
    styleUrl: './cita-create.css'
})
export class CitaCreate implements OnInit {

    clientes = signal<Usuario[]>([]);
    profesionales = signal<Profesional[]>([]);
    servicios = signal<Servicio[]>([]);
    modalidades = signal<Modalidad[]>([]);

    loading = signal(false);
    saving = signal(false);

    constructor(
        private usuarioService: UsuarioService,
        private profesionalService: ProfesionalService,
        private servicioService: ServicioService,
        private citaService: CitaService,
        private notification: NotificationService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarDatosFormulario();
    }

    private cargarDatosFormulario(): void {
        this.loading.set(true);

        forkJoin({
            usuarios:
                this.usuarioService.listar(),

            profesionales:
                this.profesionalService.listar(),

            servicios:
                this.servicioService.listar(),

            configuracion:
                this.citaService.obtenerConfiguracion()
        }).subscribe({
            next: (respuestas) => {

                console.log(
                    'Configuración recibida:',
                    respuestas.configuracion
                );

                this.clientes.set(
                    this.obtenerArreglo<Usuario>(
                        respuestas.usuarios
                    )
                );

                this.profesionales.set(
                    this.obtenerArreglo<Profesional>(
                        respuestas.profesionales
                    )
                );

                this.servicios.set(
                    this.obtenerArreglo<Servicio>(
                        respuestas.servicios
                    )
                );

                const modalidadesRecibidas =
                    respuestas.configuracion
                        .data
                        .modalidades;

                this.modalidades.set(
                    Array.isArray(modalidadesRecibidas)
                        ? modalidadesRecibidas
                        : []
                );

                console.log(
                    'Modalidades cargadas:',
                    this.modalidades()
                );

                this.loading.set(false);
            },

            error: (error) => {
                console.error(
                    'Error cargando los datos del formulario:',
                    error
                );

                this.notification.error(
                    'No se pudieron cargar los datos del formulario'
                );

                this.loading.set(false);
            }
        });
    }

    guardarCita(dto: CreateCitaDto): void {
        if (this.saving()) {
            return;
        }

        this.saving.set(true);

        this.citaService.crear(dto).subscribe({
            next: () => {
                this.notification.success(
                    'Cita registrada correctamente'
                );

                this.saving.set(false);

                this.router.navigate([
                    '/citas'
                ]);
            },
            error: (error) => {
                console.error(
                    'Error registrando cita:',
                    error
                );

                this.notification.error(
                    'No se pudo registrar la cita'
                );

                this.saving.set(false);
            }
        });
    }

    cancelar(): void {
        this.router.navigate([
            '/citas'
        ]);
    }

    private obtenerArreglo<T>(
        respuesta: unknown
    ): T[] {
        if (Array.isArray(respuesta)) {
            return respuesta as T[];
        }

        if (
            respuesta &&
            typeof respuesta === 'object' &&
            'data' in respuesta
        ) {
            const data = (
                respuesta as { data?: unknown }
            ).data;

            return Array.isArray(data)
                ? data as T[]
                : [];
        }

        return [];
    }
}
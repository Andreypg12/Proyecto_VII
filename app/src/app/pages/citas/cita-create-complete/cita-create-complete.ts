import {
    Component,
    OnDestroy,
    OnInit,
    signal
} from '@angular/core';

import {
    ActivatedRoute,
    Router
} from '@angular/router';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { forkJoin, Subscription } from 'rxjs';

import { CitaForm } from '../../../shared/components/cita-form/cita-form';

import {
    CreateCitaDto,
    Modalidad
} from '../../../core/models/cita.model';

import { Usuario } from '../../../core/models/usuario.model';
import { Servicio } from '../../../core/models/servicio.model';

import { ServicioService } from '../../../core/services/servicio.service';
import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-cita-create-complete',
    standalone: true,
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        CitaForm
    ],
    templateUrl: './cita-create-complete.html',
    styleUrl: './cita-create-complete.css'
})
export class CitaCreateComplete implements OnInit, OnDestroy {

    servicio = signal<Servicio | null>(null);
    clienteActual = signal<Usuario | null>(null);
    modalidades = signal<Modalidad[]>([]);

    loading = signal(false);
    saving = signal(false);
    error = signal<string | null>(null);

    private suscripcion: Subscription | null = null;

    constructor(
        private servicioService: ServicioService,
        private citaService: CitaService,
        private notification: NotificationService,
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        const parametroId = this.route.snapshot.paramMap.get('servicioId');
        const servicioId = Number(parametroId);

        if (!parametroId || Number.isNaN(servicioId) || servicioId <= 0) {
            this.error.set('El servicio solicitado no es válido.');
            return;
        }

        this.cargarDatos(servicioId);
    }

    ngOnDestroy(): void {
        this.suscripcion?.unsubscribe();
    }

    private cargarDatos(servicioId: number): void {
        this.loading.set(true);

        const usuarioLogueado = this.auth.usuario();

        if (!usuarioLogueado) {
            this.error.set('Debes iniciar sesión para reservar una cita.');
            this.loading.set(false);
            return;
        }

        this.clienteActual.set(usuarioLogueado);

        this.suscripcion = forkJoin({
            servicio: this.servicioService.obtenerPorId(servicioId),
            configuracion: this.citaService.obtenerConfiguracion()
        }).subscribe({
            next: (respuestas) => {
                this.servicio.set(respuestas.servicio.data);

                const modalidadesRecibidas =
                    respuestas.configuracion.data.modalidades;

                this.modalidades.set(
                    Array.isArray(modalidadesRecibidas)
                        ? modalidadesRecibidas
                        : []
                );

                this.loading.set(false);
            },
            error: (error) => {
                console.error(
                    'Error cargando el servicio para reserva:',
                    error
                );

                this.error.set(
                    'No se pudo cargar el servicio. Verificá que esté disponible.'
                );

                this.notification.error(
                    'No se pudo cargar el servicio'
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
                    'Cita reservada correctamente'
                );

                this.saving.set(false);

                this.router.navigate(['/citas']);
            },
            error: (error) => {
                console.error(
                    'Error reservando la cita:',
                    error
                );

                this.notification.error(
                    'No se pudo reservar la cita'
                );

                this.saving.set(false);
            }
        });
    }

    volver(): void {
        this.router.navigate(['/servicios']);
    }

    cancelar(): void {
        this.volver();
    }

    formatearDuracion(minutos: number): string {
        if (!minutos || minutos <= 0) {
            return '—';
        }

        const horas = Math.floor(minutos / 60);
        const restantes = minutos % 60;

        if (horas > 0) {
            return restantes > 0
                ? `${horas} h ${restantes} min`
                : `${horas} hora${horas > 1 ? 's' : ''}`;
        }

        return `${minutos} min`;
    }

    etiquetaModalidad(modalidad?: string): string {
        if (!modalidad) {
            return 'No especificada';
        }

        const etiquetas: Record<string, string> = {
            PRESENCIAL: 'Presencial',
            VIRTUAL: 'Virtual',
            'HÍBRIDA': 'Híbrida'
        };

        return etiquetas[modalidad] ?? modalidad;
    }

    private obtenerArreglo<T>(respuesta: unknown): T[] {
        if (Array.isArray(respuesta)) {
            return respuesta as T[];
        }

        if (
            respuesta &&
            typeof respuesta === 'object' &&
            'data' in respuesta
        ) {
            const data = (respuesta as { data?: unknown }).data;

            return Array.isArray(data) ? data as T[] : [];
        }

        return [];
    }
}
import {
    Component,
    computed,
    effect,
    input,
    output,
    signal,
    inject,
    OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
    FormField,
    form,
    required,
    maxLength,
    validate,
} from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
    CitaFormModel,
    CreateCitaDto,
    Modalidad
} from '../../../core/models/cita.model';

import { Usuario } from '../../../core/models/usuario.model';
import { Profesional } from '../../../core/models/profesional.model';
import { Servicio } from '../../../core/models/servicio.model';

import { ProfesionalService } from '../../../core/services/profesional.service';
import { CitaService } from '../../../core/services/cita.service';

import { Subscription } from 'rxjs';


interface HorarioCita {
    inicio: string;
    fin: string;
    etiqueta: string;
}

@Component({
    selector: 'app-cita-form',
    standalone: true,
    imports: [
        CommonModule,
        FormField,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './cita-form.html',
    styleUrl: './cita-form.css'
})



export class CitaForm implements OnDestroy {

    // Datos reales recibidos desde la página contenedora
    clientes = input<Usuario[]>([]);
    profesionales = input<Profesional[]>([]);
    servicios = input<Servicio[]>([]);

    saving = input<boolean>(false);
    fechaInicial = input<string | null>(null);

    // Modo "reserva directa": el servicio (y su profesional) ya vienen fijos.
    servicioFijo = input<Servicio | null>(null);

    // Cliente fijo (reserva desde la sesión del cliente logueado).
    clienteFijo = input<Usuario | null>(null);

    titulo = input('Registrar cita');
    subtitulo = input('Complete la información requerida para programar la cita.');

    guardar = output<CreateCitaDto>();
    cancelar = output<void>();


    private readonly profesionalService = inject(ProfesionalService);
    private readonly citaService = inject(CitaService);
    private disponibilidadSub?: Subscription;

    readonly cargandoDisponibilidad = signal(false);
    readonly citasOcupadas = signal<Array<{ inicio: string; fin: string }>>([]);
    readonly fechaSeleccionada = signal('');

    readonly slotsVacios = computed(() => {
        return !this.cargandoDisponibilidad()
            && this.horariosCita().length === 0
            && this.selectedServicio() !== null;
    });

    readonly selectedProfesional = computed(() => {
        const id = this.citaModel().id_profesional;
        return this.profesionales().find(p => p.id === id) ?? null;
    });

    readonly selectedServicio = computed(() => {
        const id = this.citaModel().id_servicio;
        return this.servicios().find(s => s.id === id) ?? null;
    });

    readonly horariosCita = computed<HorarioCita[]>(() => {
        const servicio = this.selectedServicio();
        const ocupadas = this.citasOcupadas();
        const duracion = servicio ? servicio.duracion_estimada : 60;

        const slots: HorarioCita[] = [];
        const inicioJornada = 7 * 60;
        const finJornada = 20 * 60;
        const intervalo = 30;

        for (let min = inicioJornada; min < finJornada; min += intervalo) {
            const inicioMin = min;
            const finMin = inicioMin + duracion;

            const hayConflicto = ocupadas.some(oc => {
                const ocInicio = new Date(oc.inicio);
                const ocFin = new Date(oc.fin);
                const ocInicioMin = ocInicio.getHours() * 60 + ocInicio.getMinutes();
                const ocFinMin = ocFin.getHours() * 60 + ocFin.getMinutes();
                return inicioMin < ocFinMin && finMin > ocInicioMin;
            });

            if (hayConflicto) continue;

            const formatHora = (h: number, m: number) => {
                const mm = String(m).padStart(2, '0');
                const ampm = h < 12 ? 'a. m.' : 'p. m.';
                const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                return `${h12}:${mm} ${ampm}`;
            };

            const hInicio = Math.floor(inicioMin / 60);
            const mInicio = inicioMin % 60;
            const hFin = Math.floor(finMin / 60);
            const mFin = finMin % 60;

            const inicioHH = String(hInicio).padStart(2, '0');
            const inicioMM = String(mInicio).padStart(2, '0');

            slots.push({
                inicio: `${inicioHH}:${inicioMM}`,
                fin: `${String(hFin).padStart(2, '0')}:${String(mFin).padStart(2, '0')}`,
                etiqueta: `${formatHora(hInicio, mInicio)} – ${formatHora(hFin, mFin)} (${duracion} min)`,
            });
        }

        return slots;
    });

    readonly fechaMinima = this.obtenerFechaLocal(new Date());

    citaModel = signal<CitaFormModel>({
        id_cliente: null,
        id_profesional: null,
        id_servicio: null,

        fecha: '',
        hora: null,

        modalidad: null,
        comentario_cliente: ''
    });

    constructor() {

        effect(() => {

            const fecha =
                this.fechaInicial();

            if (!fecha) {
                return;
            }

            this.citaModel.update(
                (value) => ({
                    ...value,
                    fecha
                })
            );

            this.fechaSeleccionada.set(fecha);
        });

        effect(() => {

            const servicio =
                this.servicioFijo();

            if (!servicio) {
                return;
            }

            const idProfesional =
                servicio.id_profesional ??
                servicio.profesional?.id ??
                null;

            this.citaModel.update(
                (value) => ({
                    ...value,
                    id_profesional: idProfesional,
                    id_servicio: servicio.id,
                    modalidad: servicio.modalidad || value.modalidad
                })
            );
        });

        effect(() => {
            const cliente = this.clienteFijo();

            if (!cliente) {
                return;
            }

            this.citaModel.update(
                (value) => ({
                    ...value,
                    id_cliente: cliente.id
                })
            );

            this.citaForm.id_cliente().markAsTouched();
        });

        effect(() => {
            const prof = this.selectedProfesional();
            const servicio = this.selectedServicio();
            const fecha = this.fechaSeleccionada();

            if (!prof || !fecha) {
                this.citasOcupadas.set([]);
                return;
            }

            this.cargandoDisponibilidad.set(true);

            this.disponibilidadSub?.unsubscribe();
            this.disponibilidadSub = this.citaService
                .obtenerDisponibilidad(prof.id, fecha)
                .subscribe({
                    next: (respuesta) => {
                        const data = (respuesta as any).data;
                        this.citasOcupadas.set(Array.isArray(data) ? data : []);
                        this.cargandoDisponibilidad.set(false);
                    },
                    error: () => {
                        this.citasOcupadas.set([]);
                        this.cargandoDisponibilidad.set(false);
                    }
                });
        });
    }

    ngOnDestroy(): void {
        this.disponibilidadSub?.unsubscribe();
    }

    citaForm = form(this.citaModel, (path) => {

        required(path.id_cliente, {
            message: 'Debe seleccionar un cliente'
        });

        required(path.id_profesional, {
            message: 'Debe seleccionar un profesional'
        });

        required(path.id_servicio, {
            message: 'Debe seleccionar un servicio'
        });

        required(path.fecha, {
            message: 'Debe seleccionar una fecha'
        });

        validate(path.fecha, (ctx) => {
            const fecha = ctx.value();

            if (!fecha) {
                return undefined;
            }

            if (fecha < this.fechaMinima) {
                return {
                    kind: 'fechaPasada',
                    message: 'La fecha no puede ser anterior a hoy'
                };
            }

            return undefined;
        });

        required(path.hora, {
            message: 'Debe seleccionar una hora'
        });

        validate(path.hora, (ctx) => {
            const hora = ctx.value();
            const fecha = this.citaModel().fecha;

            if (!fecha || !hora) {
                return undefined;
            }

            const fechaHora = this.crearFechaHora(fecha, hora);

            if (Number.isNaN(fechaHora.getTime())) {
                return {
                    kind: 'fechaHoraInvalida',
                    message: 'La fecha y hora seleccionadas no son válidas'
                };
            }

            if (fechaHora <= new Date()) {
                return {
                    kind: 'fechaHoraPasada',
                    message: 'La hora seleccionada ya pasó'
                };
            }

            return undefined;
        });


        required(path.comentario_cliente, {
            message:
                'Debe ingresar una descripción o comentario'
        });

        validate(path.comentario_cliente, (ctx) => {
            const comentario = ctx.value();

            if (
                !comentario ||
                comentario.trim().length === 0
            ) {
                return {
                    kind: 'comentarioRequerido',
                    message:
                        'Debe ingresar una descripción o comentario'
                };
            }

            return undefined;
        });

        maxLength(path.comentario_cliente, 500, {
            message:
                'El comentario no puede superar los 500 caracteres'
        });
    });

    isSubmitting = computed(() => this.saving());


    clientesDisponibles = computed(() =>
        this.clientes().filter(
            (cliente) =>
                cliente.rol === 'CLIENTE' &&
                cliente.estado === 'ACTIVO'
        )
    );

    profesionalesDisponibles = computed(() =>
        this.profesionales().filter(
            (profesional) => profesional.disponibilidad
        )
    );


    serviciosDisponibles = computed(() => {
        const idProfesional =
            this.citaModel().id_profesional;

        if (!idProfesional) {
            return [];
        }

        return this.servicios().filter((servicio) => {
            const idProfesionalServicio =
                servicio.id_profesional ??
                servicio.profesional?.id;

            const servicioActivo =
                servicio.estado !== false;

            return (
                servicioActivo &&
                Number(idProfesionalServicio) ===
                Number(idProfesional)
            );
        });
    });

    servicioSeleccionado = computed(() => {
        const idServicio = this.citaModel().id_servicio;
        if (!idServicio) {
            return null;
        }
        return this.servicios().find(s => s.id === idServicio) ?? null;
    });

    cambiarProfesional(): void {
        this.citaModel.update((value) => ({
            ...value,
            id_servicio: null
        }));
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

    iniciales(nombre: string): string {
        return (nombre || '')
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((parte) => parte.charAt(0))
            .join('')
            .toUpperCase();
    }

    submit(): void {
        if (this.isSubmitting()) {
            return;
        }

        this.marcarCamposComoTocados();

        if (this.formularioInvalido()) {
            return;
        }

        const dto = this.buildDto();

        console.log('JSON enviado al API:', dto);

        this.guardar.emit(dto);
    }

    private marcarCamposComoTocados(): void {
        this.citaForm.id_cliente().markAsTouched();
        this.citaForm.id_profesional().markAsTouched();
        this.citaForm.id_servicio().markAsTouched();
        this.citaForm.fecha().markAsTouched();
        this.citaForm.hora().markAsTouched();
        this.citaForm.comentario_cliente().markAsTouched();
    }

    private formularioInvalido(): boolean {
        return (
            this.citaForm.id_cliente().invalid() ||
            this.citaForm.id_profesional().invalid() ||
            this.citaForm.id_servicio().invalid() ||
            this.citaForm.fecha().invalid() ||
            this.citaForm.hora().invalid() ||
            this.citaForm.comentario_cliente().invalid()
        );
    }

    private buildDto(): CreateCitaDto {
        const value = this.citaModel();

        if (!value.fecha || !value.hora) {
            throw new Error(
                'Debe seleccionar una fecha y una hora'
            );
        }

        const fechaHora = this.crearFechaHora(
            value.fecha,
            value.hora
        );

        const servicio = this.servicioSeleccionado();

        return {
            id_cliente: Number(value.id_cliente),
            id_profesional: Number(value.id_profesional),
            id_servicio: Number(value.id_servicio),

            fecha_hora_inicio: fechaHora.toISOString(),

            modalidad: (servicio?.modalidad ?? value.modalidad ?? 'VIRTUAL') as Modalidad,

            comentario_cliente:
                value.comentario_cliente.trim() || null
        };
    }

    private crearFechaHora(
        fecha: string,
        hora: string
    ): Date {
        return new Date(`${fecha}T${hora}:00`);
    }

    private obtenerFechaLocal(fecha: Date): string {
        const anio = fecha.getFullYear();

        const mes = String(
            fecha.getMonth() + 1
        ).padStart(2, '0');

        const dia = String(
            fecha.getDate()
        ).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    onFechaChange(fecha: string) {
        this.fechaSeleccionada.set(fecha);
        this.citaModel.update(v => ({ ...v, fecha, hora: null }));
    }

    getImageUrl(imageName: string): string {
        return this.profesionalService.getImageUrl(imageName);
    }
}


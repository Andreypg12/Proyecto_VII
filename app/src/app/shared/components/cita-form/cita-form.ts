import {
    Component,
    computed,
    input,
    output,
    signal
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

import {
    CitaFormModel,
    CreateCitaDto,
    Modalidad
} from '../../../core/models/cita.model';

import { Usuario } from '../../../core/models/usuario.model';
import { Profesional } from '../../../core/models/profesional.model';
import { Servicio } from '../../../core/models/servicio.model';

interface HorarioCita {
    valor: string;
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
        MatSelectModule
    ],
    templateUrl: './cita-form.html',
    styleUrl: './cita-form.css'
})



export class CitaForm {

    // Datos reales recibidos desde la página contenedora
    clientes = input<Usuario[]>([]);
    profesionales = input<Profesional[]>([]);
    servicios = input<Servicio[]>([]);

    saving = input<boolean>(false);

    guardar = output<CreateCitaDto>();
    cancelar = output<void>();

    modalidades: Modalidad[] = [
        'PRESENCIAL',
        'VIRTUAL',
        'HÍBRIDA'
    ];

    readonly fechaMinima = this.obtenerFechaLocal(new Date());

    readonly horariosCita: HorarioCita[] = [
        {
            valor: '09:00',
            etiqueta: '9:00 a. m. – 10:00 a. m.'
        },
        {
            valor: '10:00',
            etiqueta: '10:00 a. m. – 11:00 a. m.'
        },
        {
            valor: '11:00',
            etiqueta: '11:00 a. m. – 12:00 p. m.'
        },

        // 12:00 p. m. a 1:00 p. m.: almuerzo

        {
            valor: '13:00',
            etiqueta: '1:00 p. m. – 2:00 p. m.'
        },
        {
            valor: '14:00',
            etiqueta: '2:00 p. m. – 3:00 p. m.'
        },
        {
            valor: '15:00',
            etiqueta: '3:00 p. m. – 4:00 p. m.'
        },
        {
            valor: '16:00',
            etiqueta: '4:00 p. m. – 5:00 p. m.'
        }
    ];

    citaModel = signal<CitaFormModel>({
        id_cliente: null,
        id_profesional: null,
        id_servicio: null,

        fecha: '',
        hora: null,

        modalidad: null,
        comentario_cliente: ''
    });

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

        required(path.modalidad, {
            message: 'Debe seleccionar una modalidad'
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

    /* serviciosDisponibles = computed(() => {
        const idProfesional =
            this.citaModel().id_profesional;

        if (!idProfesional) {
            return [];
        }

        return this.servicios().filter(
            (servicio) =>
                servicio.estado &&
                servicio.id_profesional === idProfesional
        );
    }); */

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

    cambiarProfesional(): void {
        this.citaModel.update((value) => ({
            ...value,
            id_servicio: null
        }));
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
        this.citaForm.modalidad().markAsTouched();
        this.citaForm.comentario_cliente().markAsTouched();
    }

    private formularioInvalido(): boolean {
        return (
            this.citaForm.id_cliente().invalid() ||
            this.citaForm.id_profesional().invalid() ||
            this.citaForm.id_servicio().invalid() ||
            this.citaForm.fecha().invalid() ||
            this.citaForm.hora().invalid() ||
            this.citaForm.modalidad().invalid() ||
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

        return {
            id_cliente: Number(value.id_cliente),
            id_profesional: Number(value.id_profesional),
            id_servicio: Number(value.id_servicio),

            fecha_hora_inicio: fechaHora.toISOString(),

            modalidad: value.modalidad as Modalidad,

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

    abrirCalendario(input: HTMLInputElement): void {
        const inputConCalendario = input as HTMLInputElement & {
            showPicker?: () => void;
        };

        if (inputConCalendario.showPicker) {
            inputConCalendario.showPicker();
            return;
        }

        input.focus();
    }
}
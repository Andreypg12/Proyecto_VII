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
    disabled
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

    citaModel = signal<CitaFormModel>({
        id_cliente: null,
        id_profesional: null,
        id_servicio: null,
        fecha_hora_inicio: '',
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

        required(path.fecha_hora_inicio, {
            message: 'La fecha y hora son obligatorias'
        });

        validate(path.fecha_hora_inicio, (ctx) => {
            const valor = ctx.value();

            if (!valor) {
                return undefined;
            }

            const fechaSeleccionada = new Date(valor);

            if (Number.isNaN(fechaSeleccionada.getTime())) {
                return {
                    kind: 'fechaInvalida',
                    message: 'La fecha y hora no son válidas'
                };
            }

            if (fechaSeleccionada <= new Date()) {
                return {
                    kind: 'fechaPasada',
                    message: 'La fecha y hora deben ser posteriores a la actual'
                };
            }

            return undefined;
        });

        required(path.modalidad, {
            message: 'Debe seleccionar una modalidad'
        });

        maxLength(path.comentario_cliente, 500, {
            message: 'El comentario no puede superar los 500 caracteres'
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

        return this.servicios().filter(
            (servicio) =>
                servicio.estado &&
                servicio.id_profesional === idProfesional
        );
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
        this.citaForm.fecha_hora_inicio().markAsTouched();
        this.citaForm.modalidad().markAsTouched();
        this.citaForm.comentario_cliente().markAsTouched();
    }

    private formularioInvalido(): boolean {
        return (
            this.citaForm.id_cliente().invalid() ||
            this.citaForm.id_profesional().invalid() ||
            this.citaForm.id_servicio().invalid() ||
            this.citaForm.fecha_hora_inicio().invalid() ||
            this.citaForm.modalidad().invalid() ||
            this.citaForm.comentario_cliente().invalid()
        );
    }

    private buildDto(): CreateCitaDto {
        const value = this.citaModel();

        return {
            id_cliente: Number(value.id_cliente),
            id_profesional: Number(value.id_profesional),
            id_servicio: Number(value.id_servicio),

            fecha_hora_inicio:
                new Date(value.fecha_hora_inicio).toISOString(),

            modalidad: value.modalidad as Modalidad,

            comentario_cliente:
                value.comentario_cliente.trim() || null
        };
    }
}
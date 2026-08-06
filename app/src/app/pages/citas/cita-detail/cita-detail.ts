import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import Swal from 'sweetalert2';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { HttpErrorResponse } from
  '@angular/common/http';

import { finalize } from 'rxjs';

import { MatIconModule } from
  '@angular/material/icon';

import {
  CambiarEstadoCitaDto,
  Cita,
  EstadoCita,
  Modalidad
} from '../../../core/models/cita.model';

import { CitaService } from
  '../../../core/services/cita.service';

@Component({
  selector: 'app-cita-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './cita-detail.html',
  styleUrl: './cita-detail.css'
})
export class CitaDetail implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly citaService =
    inject(CitaService);

  cita = signal<Cita | null>(null);

  loading = signal<boolean>(false);
  error = signal<string>('');

  //Cambio de estado
  cambiandoEstado = signal<boolean>(false);

  comentarioEstado = signal<string>('');

  mensajeEstado = signal<string>('');
  errorEstado = signal<string>('');

  ngOnInit(): void {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    if (
      Number.isNaN(id) ||
      id <= 0
    ) {
      this.router.navigate(['/citas']);
      return;
    }

    this.cargarCita(id);
  }

  cargarCita(id: number): void {

    this.loading.set(true);
    this.error.set('');

    this.citaService.obtenerPorId(id)
      .pipe(
        finalize(() =>
          this.loading.set(false)
        )
      )
      .subscribe({
        next: (response) => {
          this.cita.set(response.data);
        },

        error: (
          error: HttpErrorResponse
        ) => {

          const mensaje =
            error.error?.message ??
            'No fue posible cargar la cita.';

          this.error.set(mensaje);
        }
      });
  }

  //Cambiar estado
  actualizarComentarioEstado(
    event: Event
  ): void {

    const input =
      event.target as HTMLTextAreaElement;

    this.comentarioEstado.set(
      input.value
    );
  }


  puedeCambiarA(
    nuevoEstado: EstadoCita
  ): boolean {

    const citaActual = this.cita();

    if (!citaActual) {
      return false;
    }

    const transiciones: Record<
      string,
      EstadoCita[]
    > = {
      PENDIENTE: [
        'ACEPTADA',
        'RECHAZADA'
      ],

      ACEPTADA: [
        'COMPLETADA',
        'CANCELADA'
      ]
    };

    return (
      transiciones[citaActual.estado]
        ?.includes(nuevoEstado) ?? false
    );
  }


  requiereComentario(
    estado: EstadoCita
  ): boolean {

    return (
      estado === 'RECHAZADA' ||
      estado === 'CANCELADA'
    );
  }


  esEstadoFinal(
    estado: EstadoCita
  ): boolean {

    return [
      'RECHAZADA',
      'CANCELADA',
      'COMPLETADA'
    ].includes(estado);
  }


  async cambiarEstado(nuevoEstado: EstadoCita): Promise<void> {

    const citaActual = this.cita();

    if (
      !citaActual ||
      !this.puedeCambiarA(nuevoEstado)
    ) {
      return;
    }

    const comentario =
      this.comentarioEstado().trim();

    if (
      this.requiereComentario(nuevoEstado) &&
      !comentario
    ) {
      this.errorEstado.set(
        nuevoEstado === 'RECHAZADA'
          ? 'Debe indicar el motivo por el que se rechaza la cita.'
          : 'Debe indicar el motivo por el que se cancela la cita.'
      );

      return;
    }

    //Configuración del sweetalert
    const colorConfirmacion: Record<
      EstadoCita,
      string
    > = {
      PENDIENTE: '#d97706',
      ACEPTADA: '#15803d',
      RECHAZADA: '#be123c',
      CANCELADA: '#475569',
      COMPLETADA: '#1d4ed8'
    };

    const resultadoConfirmacion =
      await Swal.fire({

        title: 'Confirmar cambio de estado',

        html:
          `¿Desea cambiar la cita de ` +
          `<strong>${this.formatearEstado(
            citaActual.estado
          )}</strong> a ` +
          `<strong>${this.formatearEstado(
            nuevoEstado
          )}</strong>?`,

        icon:
          nuevoEstado === 'RECHAZADA' ||
            nuevoEstado === 'CANCELADA'
            ? 'warning'
            : 'question',

        showCancelButton: true,

        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'No, volver',

        confirmButtonColor:
          colorConfirmacion[nuevoEstado],

        cancelButtonColor: '#475569',

        reverseButtons: true,
        focusCancel: true,

        background: '#0f172a',
        color: '#f8fafc'
      });

    if (!resultadoConfirmacion.isConfirmed) {
      return;
    }

    const data: CambiarEstadoCitaDto = {
      estado: nuevoEstado,

      comentario_profesional:
        comentario || null
    };

    this.cambiandoEstado.set(true);
    this.errorEstado.set('');
    this.mensajeEstado.set('');

    this.citaService
      .cambiarEstado(
        citaActual.id,
        data
      )
      .pipe(
        finalize(() =>
          this.cambiandoEstado.set(false)
        )
      )
      .subscribe({

        next: (response) => {

          const resultado =
            response.data;

          this.cita.update(
            cita => cita
              ? {
                ...cita,

                estado:
                  resultado.estado,

                comentario_profesional:
                  resultado
                    .comentario_profesional,

                fecha_hora_finalizacion_real:
                  resultado
                    .fecha_hora_finalizacion_real
              }
              : cita
          );

          this.comentarioEstado.set('');

          this.mensajeEstado.set(
            response.message ??
            'Estado actualizado correctamente.'
          );

          void Swal.fire({
            title: 'Estado actualizado',
            text:
              response.message ??
              'El estado de la cita se actualizó correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#15803d',
            background: '#0f172a',
            color: '#f8fafc',
            timer: 2200,
            timerProgressBar: true
          });

        },

        error: (
          error: HttpErrorResponse
        ) => {

          const mensajeValidacion =
            error.error
              ?.validationErrors?.[0]
              ?.message;

          const mensaje =
            mensajeValidacion ??
            error.error?.message ??
            'No fue posible cambiar el estado de la cita.';

          this.errorEstado.set(mensaje);
          void Swal.fire({
            title: 'No fue posible actualizar',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#be123c',
            background: '#0f172a',
            color: '#f8fafc'
          });
        }
      });
  }

  formatearFecha(fecha: string): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    ).format(new Date(fecha));
  }

  formatearHora(fecha: string): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(new Date(fecha));
  }

  formatearFechaHora(
    fecha: string
  ): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    ).format(new Date(fecha));
  }

  formatearMonto(
    monto: string | number
  ): string {

    return new Intl.NumberFormat(
      'es-CR',
      {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
      }
    ).format(Number(monto));
  }

  formatearModalidad(
    modalidad: Modalidad
  ): string {

    switch (modalidad) {

      case 'PRESENCIAL':
        return 'Presencial';

      case 'VIRTUAL':
        return 'Virtual';

      case 'HÍBRIDA':
        return 'Híbrida';

      default:
        return modalidad;
    }
  }

  formatearEstado(
    estado: EstadoCita
  ): string {

    return estado.charAt(0) +
      estado.slice(1).toLowerCase();
  }

  formatearDuracion(
    minutos: number
  ): string {

    if (minutos < 60) {
      return `${minutos} minutos`;
    }

    const horas =
      Math.floor(minutos / 60);

    const minutosRestantes =
      minutos % 60;

    if (minutosRestantes === 0) {
      return `${horas} hora${horas === 1 ? '' : 's'
        }`;
    }

    return (
      `${horas} hora${horas === 1 ? '' : 's'} ` +
      `y ${minutosRestantes} minutos`
    );
  }
}
// Herramientas principales de Angular.
import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

// Herramientas para navegación entre páginas.
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

// Modelos y tipos relacionados con las citas.
import {
  CambiarEstadoCitaDto,
  Cita,
  EstadoCita,
  Modalidad
} from '../../../core/models/cita.model';

//Alerts
import Swal from 'sweetalert2';

// Manejo de errores provenientes de peticiones HTTP.
import { HttpErrorResponse } from'@angular/common/http';
// finalize ejecuta una acción cuando termina una petición,
import { finalize } from 'rxjs';
// Permite utilizar <mat-icon> en el HTML.
import { MatIconModule } from'@angular/material/icon';

//Backend
import { CitaService } from '../../../core/services/cita.service';

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

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);

  cita = signal<Cita | null>(null);
  loading = signal<boolean>(false);
  error = signal<string>('');

  //Cambio de estado
  cambiandoEstado = signal<boolean>(false);
  comentarioEstado = signal<string>('');
  mensajeEstado = signal<string>('');
  errorEstado = signal<string>('');


  // Obtiene el ID de la cita desde la URL y carga su información.
  ngOnInit(): void {

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(id) || id <= 0) {
      this.router.navigate(['/citas']);
      return;
    }

    this.cargarCita(id);
  }

  // Consulta el backend y carga los datos de la cita seleccionada.
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

  // Valida, confirma y solicita al backend el cambio de estado de la cita.
  async cambiarEstado(nuevoEstado: EstadoCita): Promise<void> {

    const citaActual = this.cita();

    if (!citaActual || !this.puedeCambiarA(nuevoEstado)) {
      return;
    }

    const comentario =this.comentarioEstado().trim();

      if (this.requiereComentario(nuevoEstado) && !comentario) {
        this.errorEstado.set(nuevoEstado === 'RECHAZADA'
            ? 'Debe indicar el motivo por el que se rechaza la cita.'
            : 'Debe indicar el motivo por el que se cancela la cita.'
        );

        return;
      }

    const resultadoConfirmacion = await Swal.fire({

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

        confirmButtonColor: this.obtenerColorConfirmacion(nuevoEstado),

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

    this.citaService.cambiarEstado(
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

        error: (error: HttpErrorResponse) => {

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

  // Valida si el estado actual puede cambiar al nuevo estado indicado.
  puedeCambiarA(nuevoEstado: EstadoCita): boolean {

    const citaActual = this.cita();

    if (!citaActual) {
      return false;
    }

    switch (citaActual.estado) {

      case 'PENDIENTE':

        return (
          nuevoEstado === 'ACEPTADA' ||
          nuevoEstado === 'RECHAZADA'
        );

      case 'ACEPTADA':

        return (
          nuevoEstado === 'COMPLETADA' ||
          nuevoEstado === 'CANCELADA'
        );

      default:
        return false;
    }
  }

  // Indica si el estado requiere un comentario obligatorio.
  requiereComentario(estado: EstadoCita): boolean {
    return (estado === 'RECHAZADA' || estado === 'CANCELADA');
  }

  // Devuelve el color que utiliza SweetAlert según el nuevo estado.
  obtenerColorConfirmacion(estado: EstadoCita): string {

    switch (estado) {

      case 'PENDIENTE':
        return '#d97706';

      case 'ACEPTADA':
        return '#15803d';

      case 'RECHAZADA':
        return '#be123c';

      case 'CANCELADA':
        return '#475569';

      case 'COMPLETADA':
        return '#1d4ed8';

      default:
        return '#475569';
    }
  }

  // Guarda en la señal el comentario escrito por el profesional.
  actualizarComentarioEstado(event: Event): void {

    const input = event.target as HTMLTextAreaElement;

    this.comentarioEstado.set(
      input.value
    );
  }

  // Determina si la cita ya se encuentra en un estado final.
  esEstadoFinal(estado: EstadoCita): boolean {

    return [
      'RECHAZADA',
      'CANCELADA',
      'COMPLETADA'
    ].includes(estado);
  }

  // Convierte una fecha a un formato largo y legible en español.
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

  // Convierte una fecha y muestra únicamente su hora y minutos.
  formatearHora(fecha: string): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(new Date(fecha));
  }

  // Convierte una fecha mostrando fecha y hora en un solo texto.
  formatearFechaHora(fecha: string): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    ).format(new Date(fecha));
  }

  // Convierte un número al formato de moneda de colones costarricenses.
  formatearMonto(monto: string | number): string {

    return new Intl.NumberFormat(
      'es-CR',
      {
        style: 'currency',
        currency: 'CRC',
        minimumFractionDigits: 2
      }
    ).format(Number(monto));
  }

  // Convierte el valor de modalidad a un texto más amigable para la vista.
  formatearModalidad(modalidad: Modalidad): string {

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

  // Convierte el estado de mayúsculas a un formato legible para el usuario.
  formatearEstado(estado: EstadoCita): string {

    return estado.charAt(0) +
      estado.slice(1).toLowerCase();
  }

  // Convierte una duración en minutos a horas y minutos.
  formatearDuracion(minutos: number): string {

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
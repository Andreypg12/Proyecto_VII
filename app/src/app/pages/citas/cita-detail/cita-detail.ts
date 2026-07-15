import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

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
      return `${horas} hora${
        horas === 1 ? '' : 's'
      }`;
    }

    return (
      `${horas} hora${horas === 1 ? '' : 's'} ` +
      `y ${minutosRestantes} minutos`
    );
  }
}
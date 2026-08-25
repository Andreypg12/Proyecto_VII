import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  CambiarEstadoCitaDto,
  Cita,
  EstadoCita,
  HistorialCita,
} from '../../../core/models/cita.model';

import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

import { CitaService } from '../../../core/services/cita.service';
import { ValoracionService } from '../../../core/services/valoracion.service';
import { AuthService } from '../../../core/services/auth.service';
import { ValoracionModal } from '../../../shared/components/valoracion-modal/valoracion-modal';

@Component({
  selector: 'app-cita-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule, ValoracionModal],
  templateUrl: './cita-detail.html',
  styleUrl: './cita-detail.css'
})
export class CitaDetail implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly citaService = inject(CitaService);
  private readonly valoracionService = inject(ValoracionService);
  readonly authService = inject(AuthService);

  cita = signal<Cita | null>(null);
  historial = signal<HistorialCita[]>([]);
  loading = signal(false);
  error = signal('');

  cambiandoEstado = signal(false);
  comentarioEstado = signal('');
  mensajeEstado = signal('');
  errorEstado = signal('');

  mostrarModalValoracion = signal(false);
  guardandoValoracion = signal(false);

  modalIdCita = signal(0);
  modalIdProfesional = signal(0);
  modalIdCliente = signal(0);
  modalNombreServicio = signal('');
  modalNombreProfesional = signal('');

  readonly usuarioActualId = computed(() => this.authService.usuario()?.id ?? null);

  readonly rolActual = computed(
      () => this.authService.usuario()?.rol ?? null
  );

  readonly esCliente = computed(
      () => this.rolActual() === 'CLIENTE'
  );

  readonly esProfesional = computed(
      () => this.rolActual() === 'PROFESIONAL'
  );

  readonly esAdministrador = computed(
      () => this.rolActual() === 'ADMINISTRADOR'
  );

  private readonly transiciones: Record<EstadoCita, EstadoCita[]> = {
    'PENDIENTE': ['ACEPTADA', 'RECHAZADA', 'CANCELADA'],
    'ACEPTADA': ['COMPLETADA', 'CANCELADA'],
    'RECHAZADA': [],
    'CANCELADA': [],
    'COMPLETADA': [],
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) { this.error.set('No se proporcionó un ID.'); return; }
    const id = Number(idParam);
    if (isNaN(id) || id <= 0) { this.error.set('ID no válido.'); return; }

    this.loading.set(true);
    this.citaService.obtenerPorId(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (res) => {
        this.cita.set(res.data);
        this.cargarHistorial(id);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message || 'Error al cargar la cita.');
      }
    });
  }

  private cargarHistorial(idCita: number): void {
    this.citaService.obtenerHistorial(idCita).subscribe({
      next: (res) => this.historial.set(res.data),
      error: () => this.historial.set([]),
    });
  }

  // ── Helpers ──

  formatearEstado(estado: string): string {
    const m: Record<string, string> = {
      PENDIENTE: 'Pendiente', ACEPTADA: 'Aceptada', RECHAZADA: 'Rechazada',
      CANCELADA: 'Cancelada', COMPLETADA: 'Completada',
    };
    return m[estado] || estado;
  }

  formatearFecha(f: string): string {
    return new Date(f).toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatearHora(f: string): string {
    return new Date(f).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
  }

  formatearFechaHora(f: string): string {
    return new Date(f).toLocaleString('es-CR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatearModalidad(m: string): string {
    return m ? m.charAt(0) + m.slice(1).toLowerCase() : '';
  }

  formatearMonto(v: string | number): string {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return n.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' });
  }

  formatearRol(rol: string): string {
    const m: Record<string, string> = { CLIENTE: 'Cliente', PROFESIONAL: 'Profesional', ADMINISTRADOR: 'Administrador' };
    return m[rol] || rol;
  }

  formatearDuracion(min: number): string {
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const r = min % 60;
    return r === 0 ? `${h}h` : `${h}h ${r}min`;
  }

  correoAutor(item: HistorialCita): string {
    if (item.usuario?.email) return item.usuario.email;
    if (item.realizado_por === 'CLIENTE') return `${item.cliente.nombre} ${item.cliente.apellidos}`;
    return `${item.profesional.usuario.nombre} ${item.profesional.usuario.apellidos}`;
  }

  //  Estado 

  puedeCambiarA(nuevoEstado: EstadoCita): boolean {

      const cita = this.cita();
      const usuario = this.authService.usuario();

      if (!cita || !usuario) {
          return false;
      }


      const esClientePropietario =
          usuario.rol === 'CLIENTE' &&
          cita.cliente.id === usuario.id;


      const esProfesionalAsignado =
          usuario.rol === 'PROFESIONAL' &&
          cita.profesional.usuario.id === usuario.id;


      // Pendiente
      if (cita.estado === 'PENDIENTE') {

          if (
              nuevoEstado === 'ACEPTADA' ||
              nuevoEstado === 'RECHAZADA'
          ) {
              return esProfesionalAsignado;
          }

          if (nuevoEstado === 'CANCELADA') {
              return esClientePropietario;
          }

          return false;
      }


      // Aceptada
      if (cita.estado === 'ACEPTADA') {

          if (nuevoEstado === 'COMPLETADA') {
              return esProfesionalAsignado;
          }

          if (nuevoEstado === 'CANCELADA') {
              return (
                  esClientePropietario ||
                  esProfesionalAsignado
              );
          }

          return false;
      }


      // Rechazada, cancelada, completada
      return false;
  }

  tieneTransiciones(): boolean {

    return (
        this.puedeCambiarA('ACEPTADA') ||
        this.puedeCambiarA('RECHAZADA') ||
        this.puedeCambiarA('COMPLETADA') ||
        this.puedeCambiarA('CANCELADA')
    );
}

  esEstadoFinal(estado: EstadoCita): boolean {
    return ['RECHAZADA', 'CANCELADA', 'COMPLETADA'].includes(estado);
  }

  actualizarComentarioEstado(e: Event): void {
    this.comentarioEstado.set((e.target as HTMLTextAreaElement).value);
  }

  cambiarEstado(nuevoEstado: EstadoCita): void {

    const c = this.cita();

    if (!c || this.cambiandoEstado()) {
        return;
    }

    this.cambiandoEstado.set(true);
    this.mensajeEstado.set('');
    this.errorEstado.set('');

    const dto: CambiarEstadoCitaDto = {
        estado: nuevoEstado,
        comentario_profesional:
            this.comentarioEstado().trim() || undefined,
    };

    this.citaService
        .cambiarEstado(c.id, dto)
        .pipe(
            finalize(() => {
                this.cambiandoEstado.set(false);
            })
        )
        .subscribe({

            next: (res) => {

                
                this.cita.update((actual) => {

                    if (!actual) {
                        return actual;
                    }

                    return {
                        ...actual,
                        ...res.data,
                    } as Cita;
                });

                this.mensajeEstado.set(
                    res.message ||
                    `Estado cambiado a ${this.formatearEstado(nuevoEstado)}.`
                );

                this.comentarioEstado.set('');

                // Refrescar historial después del cambio
                this.cargarHistorial(c.id);

                Swal.fire({
                    title: 'Estado actualizado',
                    text:
                        `La cita ahora está: ${this.formatearEstado(nuevoEstado)}`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#0f172a',
                    color: '#f8fafc',
                });
            },

            error: (err: HttpErrorResponse) => {

                this.errorEstado.set(
                    err.error?.message ||
                    'Error al cambiar el estado.'
                );
            },

        });
}

  // ── Valoración ──

  abrirModalValoracion(): void {
    const c = this.cita();
    if (!c) return;
    this.modalIdCita.set(c.id);
    this.modalIdProfesional.set(c.profesional.id);
    this.modalIdCliente.set(c.cliente.id);
    this.modalNombreServicio.set(c.servicio.servicio);
    this.modalNombreProfesional.set(`${c.profesional.usuario.nombre} ${c.profesional.usuario.apellidos}`);
    this.mostrarModalValoracion.set(true);
  }

  cerrarModalValoracion(): void {
    this.mostrarModalValoracion.set(false);
  }

  guardarValoracion(event: { puntuacion: number; comentario: string }): void {
    const c = this.cita();
    const u = this.authService.usuario();
    if (!c || !u) return;

    this.guardandoValoracion.set(true);

    this.valoracionService.crear({
      puntuacion: event.puntuacion,
      comentario: event.comentario,
      id_profesional: c.profesional.id,
      id_cliente: u.id,
      id_cita: c.id,
    }).subscribe({
      next: (res) => {
        this.cita.update(ci => ci ? { ...ci, valoracion: [res.data] } : ci);
        this.mostrarModalValoracion.set(false);
        this.guardandoValoracion.set(false);
        Swal.fire({ title: '¡Gracias!', text: 'Valoración registrada.', icon: 'success', timer: 2000, showConfirmButton: false, background: '#0f172a', color: '#f8fafc' });
      },
      error: (err: HttpErrorResponse) => {
        this.guardandoValoracion.set(false);
        this.mostrarModalValoracion.set(false);
        Swal.fire({ title: 'Error', text: err.error?.message || 'No se pudo guardar.', icon: 'error', background: '#0f172a', color: '#f8fafc' });
      },
    });
  }
}

import {
  Component,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import {
  Cita,
  EstadoCita
} from '../../../core/models/cita.model';

import { CitaService } from
  '../../../core/services/cita.service';

import { FiltrosGenerales } from
  '../../../shared/components/filtros-generales/filtros-generales';

import {
  TablaListado,
  ColumnaTabla
} from '../../../shared/components/tabla-listado/tabla-listado';

interface CitaListadoItem {
  id: number;
  cliente: string;
  profesional: string;
  servicio: string;
  fecha: string;
  hora: string;
  estado: EstadoCita;
}

interface ProfesionalFiltro {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-citas-list',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    FiltrosGenerales,
    TablaListado
  ],
  templateUrl: './citas-list.html',
  styleUrl: './citas-list.css'
})
export class CitasList implements OnInit {

  private readonly citaService =
    inject(CitaService);

  citas = signal<Cita[]>([]);

  loading = signal<boolean>(false);
  error = signal<string>('');

  busqueda = signal<string>('');
  estadoFiltro = signal<EstadoCita | ''>('');
  profesionalFiltro = signal<number | null>(null);
  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');

  estados: EstadoCita[] = [
    'PENDIENTE',
    'ACEPTADA',
    'RECHAZADA',
    'CANCELADA',
    'COMPLETADA'
  ];

  columnas: ColumnaTabla[] = [
    {
      titulo: 'Cliente',
      campo: 'cliente',
      tipo: 'texto'
    },
    {
      titulo: 'Profesional',
      campo: 'profesional',
      tipo: 'texto'
    },
    {
      titulo: 'Servicio',
      campo: 'servicio',
      tipo: 'texto'
    },
    {
      titulo: 'Fecha',
      campo: 'fecha',
      tipo: 'texto'
    },
    {
      titulo: 'Hora',
      campo: 'hora',
      tipo: 'texto'
    },
    {
      titulo: 'Estado',
      campo: 'estado',
      tipo: 'estado-cita'
    }
  ];

  profesionalesFiltro = computed<
    ProfesionalFiltro[]
  >(() => {

    const profesionales =
      new Map<number, string>();

    for (const cita of this.citas()) {

      const profesional = cita.profesional;

      const nombre =
        `${profesional.usuario.nombre} ` +
        `${profesional.usuario.apellidos}`;

      profesionales.set(
        profesional.id,
        nombre.trim()
      );
    }

    return Array.from(
      profesionales.entries()
    )
      .map(([id, nombre]) => ({
        id,
        nombre
      }))
      .sort((a, b) =>
        a.nombre.localeCompare(b.nombre)
      );
  });

  citasFiltradas = computed<
    CitaListadoItem[]
  >(() => {

    const texto =
      this.busqueda()
        .trim()
        .toLowerCase();

    const estado =
      this.estadoFiltro();

    const idProfesional =
      this.profesionalFiltro();

    const desde =
      this.fechaDesde()
        ? new Date(
            `${this.fechaDesde()}T00:00:00`
          )
        : null;

    const hasta =
      this.fechaHasta()
        ? new Date(
            `${this.fechaHasta()}T23:59:59`
          )
        : null;

    return this.citas()
      .filter((cita) => {

        const fechaCita =
          new Date(cita.fecha_hora_inicio);

        const nombreCliente =
          `${cita.cliente.nombre} ` +
          `${cita.cliente.apellidos}`;

        const nombreProfesional =
          `${cita.profesional.usuario.nombre} ` +
          `${cita.profesional.usuario.apellidos}`;

        const contenido = [
          nombreCliente,
          cita.cliente.email,
          nombreProfesional,
          cita.profesional.titulo,
          cita.servicio.servicio,
          cita.estado,
          cita.modalidad
        ]
          .join(' ')
          .toLowerCase();

        const coincideBusqueda =
          !texto ||
          contenido.includes(texto);

        const coincideEstado =
          !estado ||
          cita.estado === estado;

        const coincideProfesional =
          !idProfesional ||
          cita.profesional.id ===
            idProfesional;

        const coincideDesde =
          !desde ||
          fechaCita >= desde;

        const coincideHasta =
          !hasta ||
          fechaCita <= hasta;

        return (
          coincideBusqueda &&
          coincideEstado &&
          coincideProfesional &&
          coincideDesde &&
          coincideHasta
        );
      })
      .map((cita) => ({
        id: cita.id,

        cliente:
          `${cita.cliente.nombre} ` +
          `${cita.cliente.apellidos}`,

        profesional:
          `${cita.profesional.usuario.nombre} ` +
          `${cita.profesional.usuario.apellidos}`,

        servicio:
          cita.servicio.servicio,

        fecha:
          this.formatearFecha(
            cita.fecha_hora_inicio
          ),

        hora:
          this.formatearHora(
            cita.fecha_hora_inicio
          ),

        estado:
          cita.estado
      }));
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {

    this.loading.set(true);
    this.error.set('');

    this.citaService.listar()
      .pipe(
        finalize(() =>
          this.loading.set(false)
        )
      )
      .subscribe({
        next: (response) => {
          this.citas.set(
            response.data ?? []
          );
        },

        error: (
          error: HttpErrorResponse
        ) => {

          const mensaje =
            error.error?.message ??
            'No fue posible cargar las citas.';

          this.error.set(mensaje);
        }
      });
  }

  onBuscarChange(valor: string): void {
    this.busqueda.set(valor);
  }

  onEstadoChange(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    this.estadoFiltro.set(
      select.value as EstadoCita | ''
    );
  }

  onProfesionalChange(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    const valor = select.value;

    this.profesionalFiltro.set(
      valor ? Number(valor) : null
    );
  }

  onFechaDesdeChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.fechaDesde.set(input.value);
  }

  onFechaHastaChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.fechaHasta.set(input.value);
  }

  private formatearFecha(
    fecha: string
  ): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    ).format(new Date(fecha));
  }

  private formatearHora(
    fecha: string
  ): string {

    return new Intl.DateTimeFormat(
      'es-CR',
      {
        hour: '2-digit',
        minute: '2-digit'
      }
    ).format(new Date(fecha));
  }
}
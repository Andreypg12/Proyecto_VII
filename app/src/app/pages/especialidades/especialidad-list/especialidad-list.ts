import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { FiltrosGenerales } from '../../../shared/components/filtros-generales/filtros-generales';
import { TablaListado, ColumnaTabla } from '../../../shared/components/tabla-listado/tabla-listado';

import { EspecialidadService } from '../../../core/services/especialidad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Especialidad } from '../../../core/models/especialidad.model';

@Component({
  selector: 'app-especialidad-list',
  standalone: true,
  imports: [RouterLink, MatIconModule, FiltrosGenerales, TablaListado],
  templateUrl: './especialidad-list.html',
  styleUrl: './especialidad-list.css',
})
export class EspecialidadList {
  especialidades = signal<Especialidad[]>([]);

  buscar = signal('');
  estado = signal<boolean | undefined>(undefined);

  loading = signal(false);
  error = signal<string | null>(null);

  columnas: ColumnaTabla[] = [
    { titulo: 'Especialidad', campo: 'especialidad' },
    { titulo: 'Estado', campo: 'estado', tipo: 'estado' },
  ];

  especialidadesFiltradas = computed(() => {
    const texto = this.buscar().trim().toLowerCase();
    const estadoSeleccionado = this.estado();

    return this.especialidades().filter((especialidad) => {
      const nombre = especialidad.especialidad?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto);

      const coincideEstado =
        estadoSeleccionado === undefined ||
        especialidad.estado === estadoSeleccionado;

      return coincideTexto && coincideEstado;
    });
  });

  constructor(
    private especialidadService: EspecialidadService,
    private notification: NotificationService
  ) {
    this.cargarEspecialidades();
  }

  cargarEspecialidades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.especialidadService.listar().subscribe({
      next: (res) => {
        this.especialidades.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar especialidades');
        this.notification.error('Error al cargar especialidades');
        this.loading.set(false);
      },
    });
  }

  onBuscarChange(valor: string): void {
    this.buscar.set(valor);
  }

  onEstadoChange(valor: boolean | undefined): void {
    this.estado.set(valor);
  }

  limpiarFiltros(): void {
    this.buscar.set('');
    this.estado.set(undefined);
  }

  async cambiarEstado(especialidad: Especialidad): Promise<void> {
    const debeActivar = !especialidad.estado;
    const accion = debeActivar ? 'activar' : 'desactivar';

    const confirmado = await this.notification.confirmar(
      `${debeActivar ? 'Activar' : 'Desactivar'} especialidad`,
      `¿Desea ${accion} la especialidad "${especialidad.especialidad}"?`,
      debeActivar ? 'Activar' : 'Desactivar'
    );

    if (!confirmado) return;

    const peticion = debeActivar
      ? this.especialidadService.activar(especialidad.id)
      : this.especialidadService.desactivar(especialidad.id);

    peticion.subscribe({
      next: () => {
        this.notification.success(
          `Especialidad ${debeActivar ? 'activada' : 'desactivada'} correctamente`
        );
        this.cargarEspecialidades();
      },
      error: () => {
        this.notification.error(`Error al ${accion} la especialidad`);
      },
    });
  }
}
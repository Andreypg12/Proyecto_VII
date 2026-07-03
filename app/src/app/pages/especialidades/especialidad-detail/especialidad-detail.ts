import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EspecialidadService } from '../../../core/services/especialidad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Especialidad } from '../../../core/models/especialidad.model';

import { DetalleObjeto, CampoDetalle } from '../../../shared/components/detalle-objeto/detalle-objeto';

@Component({
  selector: 'app-especialidad-detail',
  standalone: true,
  imports: [RouterLink, DetalleObjeto],
  templateUrl: './especialidad-detail.html',
  styleUrl: './especialidad-detail.css',
})
export class EspecialidadDetail {
  especialidad = signal<Especialidad | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  campos: CampoDetalle[] = [
    { etiqueta: 'ID', campo: 'id' },
    { etiqueta: 'Especialidad', campo: 'especialidad' },
    { etiqueta: 'Descripción', campo: 'descripcion' },
    { etiqueta: 'Estado', campo: 'estado', tipo: 'estado' },
  ];

  constructor(
    private route: ActivatedRoute,
    private especialidadService: EspecialidadService,
    private notification: NotificationService
  ) {
    this.cargarEspecialidad();
  }

  cargarEspecialidad(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || Number.isNaN(id)) {
      this.error.set('ID inválido');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.especialidadService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.especialidad.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la especialidad');
        this.notification.error('No se pudo cargar la especialidad');
        this.loading.set(false);
      },
    });
  }
}
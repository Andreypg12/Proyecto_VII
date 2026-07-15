import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';

import { RouterLink } from '@angular/router';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';

@Component({
  selector: 'app-profesional-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  templateUrl: './profesionales-list.html',
  styleUrl: './profesionales-list.css',
})
export class ProfesionalesList implements OnInit {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly notification = inject(NotificationService);

  //Listado de profesionales
  profesionales = signal<Profesional[]>([]);

  //Filtros
  search = signal('');
  modalidad = signal<string | null>(null);
  disponibilidad = signal<boolean | null>(null);

  //Estados de UI
  loading = signal(false);
  error = signal<string | null>(null);



  ngOnInit(): void {
    this.loadProfesionales();
  }


  loadProfesionales(): void {
    this.loading.set(true);
    this.error.set(null);


    this.profesionalService.listar().subscribe({
      next: (response) => {
        console.log(response);
        this.profesionales.set(response.data);
        this.loading.set(false);
        console.log('Profesionales cargados:', response.data);
      },
      error: () => {
        this.error.set('No se pudieron cargar los profesionales.');
        this.loading.set(false);
      },
    });
  }


  profesionalesFiltrados = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const modalidadSeleccionada = this.modalidad();
    const disponibilidadSeleccionada = this.disponibilidad();

    return this.profesionales().filter((profesional) => {
      // Filtrado por texto (nombre y título)
      const nombre = profesional.usuario?.nombre?.toLowerCase() ?? '';
      const titulo = profesional.titulo?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto) ||
        titulo.includes(texto);

      // Filtrado por modalidad
      const coincideModalidad =
        modalidadSeleccionada === null ||
        modalidadSeleccionada === undefined ||
        profesional.modalidad === modalidadSeleccionada;

      // Filtrado por disponibilidad
      const coincideDisponibilidad =
        disponibilidadSeleccionada === null ||
        disponibilidadSeleccionada === undefined ||
        profesional.disponibilidad === disponibilidadSeleccionada;

      return coincideTexto && coincideModalidad && coincideDisponibilidad;
    });
  });

  totalProfesionales = computed(() => this.profesionalesFiltrados().length);

  filtrosActivos = computed(() => {
    return this.search() !== '' ||
      this.modalidad() !== null ||
      this.disponibilidad() !== null;
  });

  clearFilters(): void {
    this.search.set('');
    this.modalidad.set(null);
    this.disponibilidad.set(null);
  }

  // Método para obtener la URL de la imagen
  getImageUrl(imageName: string): string {
    return this.profesionalService.getImageUrl(imageName);
  }

  // Manejar error de carga de imagen
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    // Mostrar el placeholder
    const parent = img.parentElement;
    if (parent) {
      const placeholder = parent.querySelector('.image-placeholder');
      if (placeholder) {
        (placeholder as HTMLElement).style.display = 'flex';
      }
    }
  }

  async cambiarDisponibilidad(profesional: Profesional, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const debeActivar = !profesional.disponibilidad;
    const accion = debeActivar ? 'activar' : 'desactivar';
    const nombreProfesional = profesional.usuario?.nombre || 'este profesional';

    const confirmado = await this.notification.confirmar(
      `${debeActivar ? 'Activar' : 'Desactivar'} disponibilidad`,
      `¿Desea ${accion} la disponibilidad de ${nombreProfesional}?`,
      debeActivar ? 'Activar' : 'Desactivar'
    );

    if (!confirmado) return;

    this.profesionalService.cambiarDisponibilidad(profesional.id).subscribe({
      next: (response) => {
        this.notification.success(
          `Disponibilidad ${debeActivar ? 'activada' : 'desactivada'} correctamente`
        );

        // Actualizar el profesional en la lista
        this.profesionales.update(lista =>
          lista.map(p =>
            p.id === profesional.id
              ? { ...p, disponibilidad: response.data.disponibilidad }
              : p
          )
        );
      },
      error: () => {
        this.notification.error(
          `Error al ${accion} la disponibilidad`
        );
      },
    });
  }
}
import { Component, computed, inject, signal, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { RouterLink } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model';

@Component({
  selector: 'app-servicio-list',
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
    MatSliderModule,
    MatTooltipModule,
  ],
  templateUrl: './servicio-list.html',
  styleUrl: './servicio-list.css',
})
export class ServicioList implements OnInit {
  private readonly servicioService = inject(ServicioService);

  //Listado de servicios
  servicios = signal<Servicio[]>([]);

  //Filtros
  search = signal('');
  categoriaId = signal<number | null>(null);
  modalidad = signal<string | null>(null);

  //Estados de UI
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.listar().subscribe({
      next: (response) => {
        console.log(response);
        this.servicios.set(response.data);
        this.loading.set(false);
        console.log('Primer servicio:', response.data[0]);
        console.log('Especialidades del primer servicio:', response.data[0]?.especialidades);
        console.log('Servicios cargados:', response.data);
      },
      error: () => {
        this.error.set('No se pudieron cargar los servicios.');
        this.loading.set(false);
      },
    });
  }

  categorias = computed<CategoriaServicio[]>(() => {
    const map = new Map<number, CategoriaServicio>();
    this.servicios().forEach((service) => {
      if (service.categoria) {
        map.set(service.categoria.id, service.categoria);
      }
    });
    return Array.from(map.values());
  });

  serviciosFiltrados = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const categoriaSeleccionada = this.categoriaId();
    const modalidadSeleccionada = this.modalidad();

    return this.servicios().filter((service) => {
      //Filtrado por texto
      const nombre = service.servicio?.toLowerCase() ?? '';
      const descripcion = service.descripcion?.toLowerCase() ?? '';
      const categoriaNombre = service.categoria?.categoria?.toLowerCase() ?? '';
      const profesionalNombre = service.profesional?.usuario?.nombre?.toLowerCase() ?? '';

      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoriaNombre.includes(texto) ||
        profesionalNombre.includes(texto);

      //Filtrado por categoria
      const coincideCategoria =
        categoriaSeleccionada === null ||
        categoriaSeleccionada === undefined ||
        service.categoria?.id === categoriaSeleccionada;

      //Filtrado por modalidad
      const coincideModalidad =
        modalidadSeleccionada === null ||
        modalidadSeleccionada === undefined ||
        service.modalidad === modalidadSeleccionada;

      return coincideTexto && coincideCategoria && coincideModalidad;
    });
  });

  totalServicios = computed(() => this.serviciosFiltrados().length);

  filtrosActivos = computed(() => {
    return this.search() !== '' ||
      this.categoriaId() !== null ||
      this.modalidad() !== null;
  });

  clearFilters(): void {
    this.search.set('');
    this.categoriaId.set(null);
    this.modalidad.set(null);
  }
}
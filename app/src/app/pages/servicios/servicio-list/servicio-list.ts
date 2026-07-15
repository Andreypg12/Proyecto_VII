import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
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

import { RouterLink, Router, NavigationEnd } from '@angular/router'; // ← Agregar
import { filter } from 'rxjs/operators'; // ← Agregar
import { Subscription } from 'rxjs'; // ← Agregar

import { ServicioService } from '../../../core/services/servicio.service';
import { Servicio } from '../../../core/models/servicio.model';
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model';
import { NotificationService } from '../../../core/services/notification.service';

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
export class ServicioList implements OnInit, OnDestroy {
  private readonly servicioService = inject(ServicioService);
  private readonly router = inject(Router); // ← Inyectar Router
  private routerSubscription: Subscription | null = null; // ← Para limpiar suscripción
  private readonly notification = inject(NotificationService);

  // Listado de servicios
  servicios = signal<Servicio[]>([]);

  // Filtros
  search = signal('');
  categoriaId = signal<number | null>(null);
  modalidad = signal<string | null>(null);

  // Filtro de precio
  precioMin = signal<number>(0);
  precioMax = signal<number>(100000);
  precioMinimoGlobal = 0;
  precioMaximoGlobal = 100000;

  // Estados de UI
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServicios();

    // Escuchar cuando se navega a la lista (después de crear/editar)
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.url === '/servicios' || event.url === '/servicios/') {
          console.log('Recargando servicios al volver a la lista...');
          this.loadServicios(); // ← Esto recalcula el rango
        }
      });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.listar().subscribe({
      next: (response) => {
        console.log('Servicios cargados:', response.data.length);
        this.servicios.set(response.data);
        this.loading.set(false);

        //Calcular rango de precios con los nuevos datos
        this.calcularRangoPrecios(response.data);
      },
      error: (err) => {
        console.error('❌ Error al cargar servicios:', err);
        this.error.set('No se pudieron cargar los servicios.');
        this.loading.set(false);
      },
    });
  }

  // Calcular el rango de precios de todos los servicios
  calcularRangoPrecios(servicios: Servicio[]): void {
    if (servicios.length === 0) {
      this.precioMinimoGlobal = 0;
      this.precioMaximoGlobal = 100000;
      this.precioMin.set(0);
      this.precioMax.set(100000);
      return;
    }

    const precios = servicios
      .map(s => Number(s.precio))
      .filter(p => p > 0);

    if (precios.length === 0) {
      this.precioMinimoGlobal = 0;
      this.precioMaximoGlobal = 100000;
      this.precioMin.set(0);
      this.precioMax.set(100000);
      return;
    }

    const min = Math.min(...precios);
    const max = Math.max(...precios);

    // Redondear para mejor visualización
    this.precioMinimoGlobal = Math.floor(min / 1000) * 1000;
    this.precioMaximoGlobal = Math.ceil(max / 1000) * 1000;

    // Establecer valores iniciales del slider
    this.precioMin.set(this.precioMinimoGlobal);
    this.precioMax.set(this.precioMaximoGlobal);

    console.log(`Rango de precios: $${this.precioMinimoGlobal} - $${this.precioMaximoGlobal}`);
  }

  // Cuando el slider cambia
  onPriceChange(): void {
    if (this.precioMin() > this.precioMax()) {
      this.precioMin.set(this.precioMax());
    }
  }

  // Obtener categorías únicas de los servicios
  categorias = computed<CategoriaServicio[]>(() => {
    const map = new Map<number, CategoriaServicio>();
    this.servicios().forEach((service) => {
      if (service.categoria) {
        map.set(service.categoria.id, service.categoria);
      }
    });
    return Array.from(map.values());
  });

  // Servicios filtrados
  serviciosFiltrados = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const categoriaSeleccionada = this.categoriaId();
    const modalidadSeleccionada = this.modalidad();
    const precioMinimo = this.precioMin();
    const precioMaximo = this.precioMax();

    return this.servicios().filter((service) => {
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

      const coincideCategoria =
        categoriaSeleccionada === null ||
        categoriaSeleccionada === undefined ||
        service.categoria?.id === categoriaSeleccionada;

      const coincideModalidad =
        modalidadSeleccionada === null ||
        modalidadSeleccionada === undefined ||
        service.modalidad === modalidadSeleccionada;

      const precio = Number(service.precio);
      const coincidePrecio = precio >= precioMinimo && precio <= precioMaximo;

      return coincideTexto &&
        coincideCategoria &&
        coincideModalidad &&
        coincidePrecio
    });
  });

  totalServicios = computed(() => this.serviciosFiltrados().length);

  filtrosActivos = computed(() => {
    return this.search() !== '' ||
      this.categoriaId() !== null ||
      this.modalidad() !== null ||
      this.precioMin() > this.precioMinimoGlobal ||
      this.precioMax() < this.precioMaximoGlobal;
  });

  clearFilters(): void {
    this.search.set('');
    this.categoriaId.set(null);
    this.modalidad.set(null);
    this.precioMin.set(this.precioMinimoGlobal);
    this.precioMax.set(this.precioMaximoGlobal);
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString('es-CR');
  }

  isInPriceRange(service: Servicio): boolean {
    const precio = Number(service.precio);
    return precio >= this.precioMin() && precio <= this.precioMax();
  }

  async cambiarEstado(service: Servicio, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    const debeActivar = !service.estado;
    const accion = debeActivar ? 'activar' : 'desactivar';

    const confirmado = await this.notification.confirmar(
      `${debeActivar ? 'Activar' : 'Desactivar'} servicio`,
      `¿Desea ${accion} el servicio "${service.servicio}"?`,
      debeActivar ? 'Activar' : 'Desactivar'
    );

    if (!confirmado) return;

    this.servicioService.cambiarEstado(service.id).subscribe({
      next: (response) => {
        this.notification.success(
          `Servicio ${debeActivar ? 'activado' : 'desactivado'} correctamente`
        );

        // Actualizar el servicio en la lista
        this.servicios.update(lista =>
          lista.map(s =>
            s.id === service.id
              ? { ...s, estado: response.data.estado }
              : s
          )
        );
      },
      error: () => {
        this.notification.error(
          `Error al ${accion} el servicio`
        );
      },
    });
  }
}
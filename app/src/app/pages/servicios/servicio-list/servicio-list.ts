import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RouterLink } from '@angular/router';
import { ServicioService } from '../../../core/services/servicio-service';
import { Servicio } from '../../../core/models/servicio.model';

@Component({
  selector: 'app-servicio-list',
  imports: [
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './servicio-list.html',
  styleUrl: './servicio-list.css',
})
export class ServicioList {
  private readonly servicioService = inject(ServicioService);
  //Listado de videojuego
  servicios = signal<Servicio[]>([]);
  //Filtro de busqueda
  search = signal('');
  //Categoria seleccionada
  categoriaId = signal<number | null>(null);
  //Booleano que indica si el API da respuesta
  loading = signal(false);
  //Error del API
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServicios();
  }
  loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.servicioService.listar().subscribe({
      next: (response) => {
        console.log(response)
        this.servicios.set(response.data);
        this.loading.set(false);
        console.log('Servicios cargados:', response.data);
      },
      error: () => {
        this.error.set('No se pudieron cargar los servicios.');
        this.loading.set(false);
      },
    });
  }

  // videojuegosFiltrados = computed(() => {
  //   const texto = this.search().trim().toLowerCase();
  //   const categoriaSeleccionada = this.categoriaId()
  //   return this.servicios().filter((game) => {
  //     //Filtrado por texto
  //     const nombre = game.nombre?.toLowerCase() ?? '';
  //     const descripcion = game.descripcion?.toLowerCase() ?? '';
  //     const categoriaNombre = game.categoria?.nombre?.toLowerCase() ?? '';
  //     const coincideTexto =
  //       texto.length === 0 ||
  //       nombre.includes(texto) ||
  //       descripcion.includes(texto) ||
  //       categoriaNombre.includes(texto);
  //       //Filtrado por categoria
  //     const coincideCategoria =
  //       categoriaSeleccionada === null ||
  //       categoriaSeleccionada === undefined ||        
  //       game.categoriaId === categoriaSeleccionada ||
  //       game.categoria?.id === categoriaSeleccionada;

  //     return coincideTexto && coincideCategoria;
  //   });
  // });
  // totalVideojuegos = computed(() => this.videojuegosFiltrados().length);
  
  // clearFilters(): void {
  //   this.search.set('');
  //   this.categoriaId.set(null);
  // }

  // getImageUrl(imageName: string): string {
  //   return this.videojuegoService.getImageUrl(imageName);
  // }


}

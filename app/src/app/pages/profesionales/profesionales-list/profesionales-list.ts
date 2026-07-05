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
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';
// import { Categoria } from '../../../core/models/categoria.model';


@Component({
  selector: 'app-profesionales-list',
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
  templateUrl: './profesionales-list.html',
  styleUrl: './profesionales-list.css',
})
export class ProfesionalesList {
  private readonly profesionalService = inject(ProfesionalService);
  //Listado de videojuego
  profesionales = signal<Profesional[]>([]);
  //Filtro de busqueda
  search = signal('');
  //Categoria seleccionada
  categoriaId = signal<number | null>(null);
  //Booleano que indica si el API da respuesta
  loading = signal(false);
  //Error del API
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadVideojuegos();
  }
  loadVideojuegos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.profesionalService.listar().subscribe({
      next: (response) => {
        console.log(response)
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

  // categorias = computed<Categoria[]>(() => {
  //   const map = new Map<number, Categoria>();
  //   this.videojuegos().forEach((game) => {
  //     if (game.categoria) {
  //       map.set(game.categoria.id, game.categoria);
  //     }
  //   });
  //   return Array.from(map.values());
  // });

  videojuegosFiltrados = computed(() => {
    const texto = this.search().trim().toLowerCase();
    // const categoriaSeleccionada = this.categoriaId()

    return this.profesionales().filter((profesional) => {
      //Filtrado por texto
      const nombre = profesional.usuario?.nombre?.toLowerCase() ?? '';
      // const descripcion = game.descripcion?.toLowerCase() ?? '';
      // const categoriaNombre = game.categoria?.nombre?.toLowerCase() ?? '';
      const coincideTexto =
        texto.length === 0 ||
        nombre.includes(texto) /* || */
      // descripcion.includes(texto) ||
      // categoriaNombre.includes(texto);
      //  Filtrado por categoria
      // const coincideCategoria =
      //   categoriaSeleccionada === null ||
      //   categoriaSeleccionada === undefined ||        
      //   game.categoriaId === categoriaSeleccionada ||
      //   game.categoria?.id === categoriaSeleccionada;

      return coincideTexto /* && coincideCategoria */;
    });
  });
  totalProfesionales = computed(() => this.videojuegosFiltrados().length);

  clearFilters(): void {
    this.search.set('');
    // this.categoriaId.set(null);
  }

  getImageUrl(imageName: string): string {
    return this.profesionalService.getImageUrl(imageName);
  }
}

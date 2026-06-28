import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CategoriaServicioService } from '../../../core/services/categoria-servicio';
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model';

@Component({
    selector: 'app-categoria-servicio-list',
    imports: [RouterLink],
    templateUrl: './categoria-servicio-list.html',
    styleUrl: './categoria-servicio-list.css'
})
export class CategoriaServicioList {
    private readonly categoriaServicioService = inject(CategoriaServicioService);

    categorias = signal<CategoriaServicio[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadCategorias();
    }

    loadCategorias(): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoriaServicioService.listar().subscribe({
            next: (response) => {
                this.categorias.set(response.data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudieron cargar las categorías de servicio.');
                this.loading.set(false);
            }
        });
    }
}
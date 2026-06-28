import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriaServicioService } from '../../../core/services/categoria-servicio';
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model';

@Component({
    selector: 'app-categoria-servicio-detail',
    imports: [RouterLink],
    templateUrl: './categoria-servicio-detail.html',
    styleUrl: './categoria-servicio-detail.css'
})
export class CategoriaServicioDetail {
    private readonly route = inject(ActivatedRoute);
    private readonly categoriaServicioService = inject(CategoriaServicioService);

    categoria = signal<CategoriaServicio | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!id) {
            this.error.set('El identificador de la categoría no es válido.');
            return;
        }

        this.loadCategoria(id);
    }

    loadCategoria(id: number): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoriaServicioService.obtenerPorId(id).subscribe({
            next: (response) => {
                this.categoria.set(response.data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('No se pudo cargar el detalle de la categoría.');
                this.loading.set(false);
            }
        });
    }
}
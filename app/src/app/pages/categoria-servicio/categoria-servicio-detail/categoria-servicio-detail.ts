import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CategoriaServicioService } from '../../../core/services/categoria-servicio.service';
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model';
import { DetalleObjeto, CampoDetalle } from '../../../shared/components/detalle-objeto/detalle-objeto';

@Component({
    selector: 'app-categoria-servicio-detail',
    imports: [RouterLink, DetalleObjeto],
    templateUrl: './categoria-servicio-detail.html',
    styleUrl: './categoria-servicio-detail.css'
})
export class CategoriaServicioDetail {
    private readonly route = inject(ActivatedRoute);
    private readonly categoriaServicioService = inject(CategoriaServicioService);

    categoria = signal<CategoriaServicio | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    campos: CampoDetalle[] = [
        { etiqueta: 'ID', campo: 'id' },
        { etiqueta: 'Nombre de la categoría', campo: 'categoria' },
        { etiqueta: 'Descripción', campo: 'descripcion', completo: true },
    ];

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
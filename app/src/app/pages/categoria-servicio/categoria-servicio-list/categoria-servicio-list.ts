import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltrosGenerales } from '../../../shared/components/filtros-generales/filtros-generales';
import { CategoriaServicioService } from '../../../core/services/categoria-servicio.service';
import { MatIconModule } from '@angular/material/icon';
import { TablaListado, ColumnaTabla } from '../../../shared/components/tabla-listado/tabla-listado';

@Component({
    selector: 'app-categoria-servicio-list',
    standalone: true,
    imports: [RouterLink, FiltrosGenerales, MatIconModule, TablaListado],
    templateUrl: './categoria-servicio-list.html',
    styleUrl: './categoria-servicio-list.css',
})
export class CategoriaServicioList {
    categorias = signal<any[]>([]);
    loading = signal(false);
    error = signal<string | null>(null);

    buscar = signal('');
    estado = signal<boolean | undefined>(undefined);

    columnas: ColumnaTabla[] = [
        { titulo: 'Nombre', campo: 'categoria' },
        { titulo: 'Estado', campo: 'estado', tipo: 'estado' },
    ];

    constructor(private categoriaService: CategoriaServicioService) {
        this.cargarCategorias();
    }

    cargarCategorias(): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoriaService.listar(this.buscar(), this.estado()).subscribe({
            next: (res) => {
                this.categorias.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar categorías');
                this.loading.set(false);
            },
        });
    }

    onBuscarChange(valor: string): void {
        this.buscar.set(valor);
        this.cargarCategorias();
    }

    onEstadoChange(valor: boolean | undefined): void {
        this.estado.set(valor);
        this.cargarCategorias();
    }

    cambiarEstado(categoria: any): void {
        const nuevoEstado = !categoria.estado;

        this.categoriaService.cambiarEstado(categoria.id, nuevoEstado).subscribe({
            next: () => {
                this.cargarCategorias();
            },
            error: () => {
                this.error.set('Error al cambiar el estado');
            },
        });
    }
}
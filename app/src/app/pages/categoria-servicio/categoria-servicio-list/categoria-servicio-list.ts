import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FiltrosGenerales } from '../../../shared/components/filtros-generales/filtros-generales';
import { CategoriaServicioService } from '../../../core/services/categoria-servicio.service';
import { MatIconModule } from '@angular/material/icon';
import { TablaListado, ColumnaTabla } from '../../../shared/components/tabla-listado/tabla-listado';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-categoria-servicio-list',
    standalone: true,
    imports: [RouterLink, FiltrosGenerales, MatIconModule, TablaListado],
    templateUrl: './categoria-servicio-list.html',
    styleUrl: './categoria-servicio-list.css',
})
export class CategoriaServicioList {
    categorias = signal<any[]>([]);

    buscar = signal('');
    estado = signal<boolean | undefined>(undefined);

    loading = signal(false);
    error = signal<string | null>(null);

    columnas: ColumnaTabla[] = [
        { titulo: 'Nombre', campo: 'categoria' },
        { titulo: 'Estado', campo: 'estado', tipo: 'estado' },
    ];

    categoriasFiltradas = computed(() => {
        const texto = this.buscar().trim().toLowerCase();
        const estadoSeleccionado = this.estado();

        return this.categorias().filter((categoria) => {
            const nombre = categoria.categoria?.toLowerCase() ?? '';

            const coincideTexto =
                texto.length === 0 ||
                nombre.includes(texto);

            const coincideEstado =
                estadoSeleccionado === undefined ||
                categoria.estado === estadoSeleccionado;

            return coincideTexto && coincideEstado;
        });
    });

    totalCategorias = computed(() => this.categoriasFiltradas().length);

    constructor(
        private categoriaService: CategoriaServicioService,
        private notification: NotificationService
    ) {
        this.cargarCategorias();
    }

    cargarCategorias(): void {
        this.loading.set(true);
        this.error.set(null);

        this.categoriaService.listar().subscribe({
            next: (res) => {
                this.categorias.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar categorías');
                this.notification.error('Error al cargar categorías');
                this.loading.set(false);
            },
        });
    }

    onBuscarChange(valor: string): void {
        this.buscar.set(valor);
    }

    onEstadoChange(valor: boolean | undefined): void {
        this.estado.set(valor);
    }

    limpiarFiltros(): void {
        this.buscar.set('');
        this.estado.set(undefined);
    }

    async cambiarEstado(categoria: any): Promise<void> {
        const debeActivar = !categoria.estado;
        const accion = debeActivar ? 'activar' : 'desactivar';

        const confirmado = await this.notification.confirmar(
            `${debeActivar ? 'Activar' : 'Desactivar'} categoría`,
            `¿Desea ${accion} la categoría "${categoria.categoria}"?`,
            debeActivar ? 'Activar' : 'Desactivar'
        );

        if (!confirmado) return;

        const peticion = debeActivar
            ? this.categoriaService.activar(categoria.id)
            : this.categoriaService.desactivar(categoria.id);

        peticion.subscribe({
            next: () => {
                this.notification.success(
                    `Categoría ${debeActivar ? 'activada' : 'desactivada'} correctamente`
                );

                this.cargarCategorias();
            },
            error: () => {
                this.notification.error(
                    `Error al ${accion} la categoría`
                );
            },
        });
    }
}
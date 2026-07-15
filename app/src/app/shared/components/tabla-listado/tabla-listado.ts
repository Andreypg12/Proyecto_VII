import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface ColumnaTabla {
  titulo: string;
  campo: string;

  tipo?:
    | 'texto'
    | 'estado'
    | 'estado-usuario'
    | 'estado-cita';
}

@Component({
  selector: 'app-tabla-listado',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule
  ],
  templateUrl: './tabla-listado.html',
  styleUrl: './tabla-listado.css',
})
export class TablaListado {

  columnas = input.required<ColumnaTabla[]>();
  datos = input.required<any[]>();
  rutaDetalle = input.required<string>();

  cambiarEstado = output<any>();

  formatearEstadoCita(estado: string): string {
    if (!estado) {
      return '';
    }

    return estado.charAt(0) +
      estado.slice(1).toLowerCase();
  }
}
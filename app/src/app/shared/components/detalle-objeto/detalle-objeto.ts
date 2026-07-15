import { Component, input } from '@angular/core';

export interface CampoDetalle {
  etiqueta: string;
  campo: string;
  tipo?: 'texto' | 'estado' | 'estado-usuario';
  completo?: boolean;
}

@Component({
  selector: 'app-detalle-objeto',
  standalone: true,
  imports: [],
  templateUrl: './detalle-objeto.html',
  styleUrl: './detalle-objeto.css',
})
export class DetalleObjeto {
  titulo = input.required<string>();
  descripcion = input<string>('');
  objeto = input.required<any>();
  campos = input.required<CampoDetalle[]>();
}
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filtros-generales',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './filtros-generales.html',
  styleUrl: './filtros-generales.css',
})
export class FiltrosGenerales {
  // Inputs
  showSearch = input<boolean>(true);
  showStatus = input<boolean>(true);
  showRole = input<boolean>(false);

  roles = input<string[]>([]);

  // Outputs
  searchChange = output<string>();
  statusChange = output<boolean | undefined>();
  roleChange = output<string | undefined>();

  // Valores internos
  search = signal('');
  status = signal<boolean | undefined>(undefined);
  role = signal<string | undefined>(undefined);

  

  onSearchChange(value: string): void {
    this.search.set(value);
    this.searchChange.emit(value);
  }

  onStatusChange(value: string): void {
    if (value === '') {
      this.status.set(undefined);
      this.statusChange.emit(undefined);
      return;
    }

    const estado = value === 'true';

    this.status.set(estado);
    this.statusChange.emit(estado);
  }

  onRolChange(value: string): void {
    const rolSeleccionado =
      value === '' ? undefined : value;

    this.role.set(rolSeleccionado);
    this.roleChange.emit(rolSeleccionado);
  }

  formatearEtiqueta(value: string): string {
    const texto = value
      .toLowerCase()
      .replaceAll('_', ' ');

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
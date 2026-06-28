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
  showSearch = input(true);
  showStatus = input(true);

  searchChange = output<string>();
  statusChange = output<boolean | undefined>();

  search = signal('');
  status = signal<boolean | undefined>(undefined);

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
}
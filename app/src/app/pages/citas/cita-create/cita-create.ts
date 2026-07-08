import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { CitaForm } from '../../../shared/components/cita-form/cita-form';
import { CreateCitaDto } from '../../../core/models/cita.model';

@Component({
  selector: 'app-cita-create',
  standalone: true,
  imports: [
    CitaForm
  ],
  templateUrl: './cita-create.html',
  styleUrl: './cita-create.css'
})
export class CitaCreate {

  constructor(
    private readonly router: Router
  ) {}

  guardarCita(data: CreateCitaDto): void {
    console.log('Datos recibidos del formulario:', data);

    /*
     * Después se llamará:
     *
     * this.citaService.crear(data).subscribe(...)
     */
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }
}
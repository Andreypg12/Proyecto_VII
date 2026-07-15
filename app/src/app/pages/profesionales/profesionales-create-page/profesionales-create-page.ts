import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router } from '@angular/router'
import { forkJoin } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { ProfesionalForm } from '../../../shared/components/profesional-form/profesional-form'
import { ProfesionalService } from '../../../core/services/profesional.service'
import { EspecialidadService } from '../../../core/services/especialidad.service'

import { Especialidad } from '../../../core/models/especialidad.model'
import { ProfesionalCreateDto, ProfesionalUpdateDto } from '../../../core/models/profesional.model'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector: 'app-profesional-create-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProfesionalForm
  ],
  templateUrl: './profesionales-create-page.html',
  styleUrl: './profesionales-create-page.css',
})
export class ProfesionalCreatePage {
  private readonly router = inject(Router)
  private readonly profesionalService = inject(ProfesionalService)
  private readonly especialidadService = inject(EspecialidadService)
  private readonly notification = inject(NotificationService);
  

  especialidades = signal<Especialidad[]>([])

  loading = signal(true)
  saving = signal(false)
  error = signal<string | null>(null)
  

  constructor() {
    this.cargarDatosFormulario()
  }

  cargarDatosFormulario() {
    this.loading.set(true)
    this.error.set(null)

    forkJoin({
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ especialidades }) => {
        this.especialidades.set(especialidades.data ?? [])
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario')
        this.router.navigate(['/profesionales'])
      },
      complete: () => {
        this.loading.set(false)
      },
    })
  }

  guardar(data: ProfesionalCreateDto | ProfesionalUpdateDto) {
    this.saving.set(true)
    this.error.set(null)

    console.log("Data a enviar:", JSON.stringify(data, null, 2))

    this.profesionalService.crear(data as ProfesionalCreateDto).subscribe({
      next: () => {
        this.notification.success("Profesional creado correctamente")
        this.router.navigate(['/profesionales'])
      },
      error: (error) => {
        console.error('Error al crear:', error)
        this.error.set('No se pudo registrar el profesional')
        this.saving.set(false)
      },
      complete: () => {
        this.saving.set(false)
      },
    })
  }

  cancelar() {
    this.router.navigate(['/profesionales'])
  }

  volver() {
    this.router.navigate(['/profesionales'])
  }
}
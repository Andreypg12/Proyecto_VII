import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { forkJoin } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { ProfesionalForm } from '../../../shared/components/profesional-form/profesional-form'
import { ProfesionalService } from '../../../core/services/profesional.service'
import { EspecialidadService } from '../../../core/services/especialidad.service'

import { Profesional, ProfesionalCreateDto, ProfesionalUpdateDto } from '../../../core/models/profesional.model'
import { Especialidad } from '../../../core/models/especialidad.model'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector: 'app-profesional-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ProfesionalForm
  ],
  templateUrl: './profesionales-edit-page.html',
  styleUrl: './profesionales-edit-page.css',
})
export class ProfesionalEditPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly profesionalService = inject(ProfesionalService)
  private readonly especialidadService = inject(EspecialidadService)
  private readonly notification = inject(NotificationService);

  profesional = signal<Profesional | null>(null)
  especialidades = signal<Especialidad[]>([])

  loading = signal(true)
  saving = signal(false)
  error = signal<string | null>(null)

  private readonly id = Number(this.route.snapshot.paramMap.get('id'))

  constructor() {
    this.cargarDatosFormulario()
  }

  cargarDatosFormulario() {
    if (!this.id) {
      this.error.set('El identificador del profesional no es válido')
      this.loading.set(false)
      return
    }

    this.loading.set(true)
    this.error.set(null)

    forkJoin({
      profesional: this.profesionalService.obtenerPorId(this.id),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ profesional, especialidades }) => {
        console.log('Profesional recibido:', profesional)

        // Normalizar datos si es necesario
        const profesionalData = profesional.data

        this.profesional.set(profesionalData)
        this.especialidades.set(especialidades.data ?? [])
      },
      error: (error) => {
        console.error('Error al cargar datos:', error)
        this.error.set('No se pudo cargar la información del profesional')
        this.loading.set(false)
      },
      complete: () => {
        this.loading.set(false)
      },
    })
  }

  guardar(data: ProfesionalCreateDto | ProfesionalUpdateDto) {
    if (!this.id) return

    this.saving.set(true)
    this.error.set(null)

    console.log("Data a enviar:", JSON.stringify(data, null, 2))

    this.profesionalService.actualizar(this.id, data as ProfesionalUpdateDto).subscribe({
      next: () => {
        this.notification.success("Profesional editado correctamente")
        this.router.navigate(['/profesionales'])
      },
      error: (error) => {
        console.error('Error al actualizar:', error)
        this.error.set('No se pudo actualizar el profesional')
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
}
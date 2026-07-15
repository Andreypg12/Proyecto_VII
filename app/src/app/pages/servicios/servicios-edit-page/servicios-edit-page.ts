import { Component, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { forkJoin } from 'rxjs'

import { MatCardModule } from '@angular/material/card'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form'
import { ServicioService } from '../../../core/services/servicio.service'
import { CategoriaServicioService } from '../../../core/services/categoria-servicio.service'
import { ProfesionalService } from '../../../core/services/profesional.service'
import { EspecialidadService } from '../../../core/services/especialidad.service'

import { Servicio, ServicioCreateDto, ServicioUpdateDto } from '../../../core/models/servicio.model'
import { CategoriaServicio } from '../../../core/models/categoriaServicio.model'
import { Profesional } from '../../../core/models/profesional.model'
import { Especialidad } from '../../../core/models/especialidad.model'
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector: 'app-servicio-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ServicioForm
  ],
  templateUrl: './servicios-edit-page.html',
  styleUrl: './servicios-edit-page.css',
})
export class ServicioEditPage {
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly servicioService = inject(ServicioService)
  private readonly categoriaService = inject(CategoriaServicioService)
  private readonly profesionalService = inject(ProfesionalService)
  private readonly especialidadService = inject(EspecialidadService)
  private readonly notification = inject(NotificationService);

  servicio = signal<Servicio | null>(null)
  categorias = signal<CategoriaServicio[]>([])
  profesionales = signal<Profesional[]>([])
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
      this.error.set('El identificador del servicio no es válido')
      this.loading.set(false)
      return
    }

    this.loading.set(true)
    this.error.set(null)

    forkJoin({
      servicio: this.servicioService.obtenerPorId(this.id),
      categorias: this.categoriaService.listar(),
      profesionales: this.profesionalService.listar(),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ servicio, categorias, profesionales, especialidades }) => {
        console.log('Servicio recibido:', servicio)
        console.log('Servicio.data:', servicio.data)
        console.log('Categorías:', categorias)
        console.log('Profesionales:', profesionales)
        console.log('Especialidades:', especialidades)
        this.servicio.set(servicio.data)
        this.categorias.set(categorias.data ?? [])
        this.profesionales.set(profesionales.data ?? [])
        this.especialidades.set(especialidades.data ?? [])
      },
      error: () => {
        this.error.set('No se pudo cargar la información del servicio')
        this.loading.set(false)
      },
      complete: () => {
        this.loading.set(false)
      },
    })
  }

  guardar(data: ServicioCreateDto | ServicioUpdateDto) {
    if (!this.id) return

    this.saving.set(true)
    this.error.set(null)

    console.log("Data: ", data)

    this.servicioService.actualizar(this.id, data as ServicioUpdateDto).subscribe({
      next: () => {
        this.notification.success("Servicio editado correctamente")
        this.router.navigate(['/servicios'])
      },
      error: () => {
        this.error.set('No se pudo actualizar el servicio')
      },
      complete: () => {
        this.saving.set(false)
      },
    })
  }

  cancelar() {
    this.router.navigate(['/servicios'])
  }
}
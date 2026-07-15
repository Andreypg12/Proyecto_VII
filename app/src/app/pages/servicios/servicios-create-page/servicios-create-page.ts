import { Component, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { forkJoin } from 'rxjs'
import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form'
import { ServicioService } from '../../../core/services/servicio.service'
import { CategoriaServicioService } from '../../../core/services/categoria-servicio.service'
import { ProfesionalService } from '../../../core/services/profesional.service'
import { EspecialidadService } from '../../../core/services/especialidad.service'

import { CategoriaServicio } from '../../../core/models/categoriaServicio.model'
import { Profesional } from '../../../core/models/profesional.model'
import { Especialidad } from '../../../core/models/especialidad.model'
import { ServicioCreateDto, ServicioUpdateDto } from '../../../core/models/servicio.model'
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";
import { NotificationService } from '../../../core/services/notification.service'

@Component({
  selector: 'app-servicio-create-page',
  standalone: true,
  imports: [ServicioForm, MatProgressSpinner, MatIcon],
  templateUrl: './servicios-create-page.html',
})
export class ServicioCreatePage {
  private readonly router = inject(Router)
  private readonly servicioService = inject(ServicioService)
  private readonly categoriaService = inject(CategoriaServicioService)
  private readonly profesionalService = inject(ProfesionalService)
  private readonly especialidadService = inject(EspecialidadService)
  private readonly notification = inject(NotificationService);

  categorias = signal<CategoriaServicio[]>([])
  profesionales = signal<Profesional[]>([])
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
    //forkJoin agrupa todo y devuelve todos los resultados juntos
    forkJoin({
      categorias: this.categoriaService.listar(),
      profesionales: this.profesionalService.listar(),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: ({ categorias, profesionales, especialidades }) => {
        this.categorias.set(categorias.data ?? [])
        this.profesionales.set(profesionales.data ?? [])
        this.especialidades.set(especialidades.data ?? [])
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario')
        this.router.navigate(['/servicios'])
      },
      complete: () => {
        this.loading.set(false)
      },
    })
  }
  guardar(data: ServicioCreateDto | ServicioUpdateDto) {
    this.saving.set(true)
    this.error.set(null)
    console.log("Data: ", data)
    this.servicioService.crear(data as ServicioCreateDto).subscribe({
      next: () => {
        this.notification.success("Servicio creado correctamente")
        this.router.navigate(['/servicios'])
      },
      error: () => {
        this.error.set('No se pudo registrar el servicio')
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
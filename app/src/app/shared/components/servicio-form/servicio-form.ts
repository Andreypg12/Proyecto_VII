import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import {
  FormField,
  form,
  required,
  min,
  minLength,
  maxLength,
  validate,
  pattern
} from '@angular/forms/signals'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import {
  Servicio,
  ServicioCreateDto,
  ServicioFormModel,
  ServicioUpdateDto,
  Modalidad
} from '../../../core/models/servicio.model'

import { CategoriaServicio } from '../../../core/models/categoriaServicio.model'
import { Especialidad } from '../../../core/models/especialidad.model'
import { Profesional } from '../../../core/models/profesional.model'

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './servicio-form.html',
  styleUrl: './servicio-form.css',
})
export class ServicioForm {
  // Inputs
  servicio = input<Servicio | null>(null)
  categorias = input<CategoriaServicio[]>([])
  profesionales = input<Profesional[]>([])
  especialidades = input<Especialidad[]>([])
  saving = input<boolean>(false)  // ← Este viene del padre

  // Outputs
  guardar = output<ServicioCreateDto | ServicioUpdateDto>()
  cancelar = output<void>()

  // Estado local de error
  errorMensaje = signal<string | null>(null)

  // Modelo del formulario
  servicioModel = signal<ServicioFormModel>({
    servicio: '',
    descripcion: '',
    precio: 0,
    duracion_estimada: 0,
    estado: true,
    modalidad: 'VIRTUAL',
    categoria_id: null,
    profesional_id: null,
    especialidades_Ids: [],
  })

  // Validaciones del formulario
  servicioForm = form(this.servicioModel, (path) => {
    required(path.servicio, {
      message: 'El nombre del servicio es obligatorio'
    })
    minLength(path.servicio, 3, {
      message: 'Mínimo 3 caracteres'
    })
    maxLength(path.servicio, 100, {
      message: 'Máximo 100 caracteres'
    })
    pattern(path.servicio, /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s:'\-&.]+$/, {
      message: 'El nombre solo puede contener letras, números, espacios y signos básicos'
    })
    validate(path.servicio, (ctx) => {
      const servicio = ctx.value().trim()
      if (servicio.length > 0 && servicio === servicio.toUpperCase()) {
        return {
          kind: 'nombreMayusculas',
          message: 'No escriba todo el nombre en mayúsculas'
        }
      }
      return undefined
    })

    required(path.descripcion, {
      message: 'La descripción es obligatoria'
    })
    minLength(path.descripcion, 20, {
      message: 'La descripción debe tener mínimo 20 caracteres'
    })
    maxLength(path.descripcion, 500, {
      message: 'Máximo 500 caracteres'
    })
    validate(path.descripcion, (ctx) => {
      const descripcion = ctx.value().trim()
      if (descripcion.length > 0 && descripcion.split(/\s+/).length < 5) {
        return {
          kind: 'descripcionCorta',
          message: 'La descripción debe contener al menos 5 palabras'
        }
      }
      return undefined
    })

    required(path.precio, {
      message: 'El precio es obligatorio'
    })
    min(path.precio, 1, {
      message: 'El precio debe ser mayor a 0'
    })
    validate(path.precio, (ctx) => {
      const precio = Number(ctx.value())
      if (precio > 1000000) {
        return {
          kind: 'precioExcesivo',
          message: 'El precio no puede superar $1,000,000'
        }
      }
      return undefined
    })

    required(path.duracion_estimada, {
      message: 'La duración es obligatoria'
    })
    min(path.duracion_estimada, 30, {
      message: 'La duración no puede ser menor de 30 minutos'
    })
    validate(path.duracion_estimada, (ctx) => {
      const duracion = Number(ctx.value())
      if (!Number.isInteger(duracion)) {
        return {
          kind: 'duracionEntero',
          message: 'La duración debe ser un número entero'
        }
      }
      if (duracion > 1440) {
        return {
          kind: 'duracionExcesiva',
          message: 'La duración no puede superar 1440 minutos (24 horas)'
        }
      }
      return undefined
    })

    required(path.modalidad, {
      message: 'Se debe seleccionar una modalidad'
    })

    required(path.profesional_id, {
      message: 'Debe seleccionar un profesional'
    })

    required(path.categoria_id, {
      message: 'Debe seleccionar una categoría'
    })

    validate(path.especialidades_Ids, (ctx) => {
      const especialidades = ctx.value()
      if (!especialidades || especialidades.length === 0) {
        return {
          kind: 'especialidadRequerida',
          message: 'Seleccione al menos una especialidad'
        }
      }
      return undefined
    })
  })

  isEdit = computed(() => !!this.servicio())


  isSubmitting = computed(() => this.saving())

  constructor() {
    effect(() => {
      const servicio = this.servicio()
      if (!servicio) {
        this.resetForm()
        return
      }

      this.servicioModel.set({
        servicio: servicio.servicio ?? '',
        descripcion: servicio.descripcion ?? '',
        precio: Number(servicio.precio ?? 0),
        duracion_estimada: Number(servicio.duracion_estimada ?? 0),
        estado: servicio.estado ?? true,
        modalidad: servicio.modalidad ?? 'VIRTUAL',
        profesional_id: servicio.id_profesional ?? null,
        categoria_id: servicio.id_categoria ?? null,
        especialidades_Ids: servicio.especialidades?.map((item) => item.id) ?? [],
      })

      // Limpiar error al cargar datos
      this.errorMensaje.set(null)
    })
  }

  private resetForm() {
    this.servicioModel.set({
      servicio: '',
      descripcion: '',
      precio: 0,
      duracion_estimada: 0,
      estado: true,
      modalidad: 'VIRTUAL',
      categoria_id: null,
      profesional_id: null,
      especialidades_Ids: [],
    })
    this.errorMensaje.set(null)
  }

  toggleEspecialidad(id: number, checked: boolean) {
    this.servicioModel.update((value) => ({
      ...value,
      especialidades_Ids: checked
        ? Array.from(new Set([...value.especialidades_Ids, id]))
        : value.especialidades_Ids.filter((item) => item !== id),
    }))
    this.servicioForm.especialidades_Ids().markAsTouched()
    this.errorMensaje.set(null)
  }

  isEspecialidadSelected(id: number): boolean {
    return this.servicioModel().especialidades_Ids.includes(id)
  }

  submit() {
    // 1. Si ya está enviando, no hacer nada
    if (this.isSubmitting()) return

    // 2. Limpiar error anterior
    this.errorMensaje.set(null)

    // 3. Marcar campos como tocados
    this.marcarCamposComoTocados()

    // 4. Validar formulario
    if (this.formularioInvalido()) {
      return
    }

    // 5. Intentar guardar
    try {
      const dto = this.buildDto()
      console.log('JSON enviado al API:', JSON.stringify(dto, null, 2))
      this.guardar.emit(dto)
    } catch (error) {
      // Si hay error en buildDto, mostrar mensaje
      this.errorMensaje.set(error instanceof Error ? error.message : 'Error al procesar los datos')
    }
  }

  private marcarCamposComoTocados() {
    this.servicioForm.servicio().markAsTouched()
    this.servicioForm.descripcion().markAsTouched()
    this.servicioForm.precio().markAsTouched()
    this.servicioForm.duracion_estimada().markAsTouched()
    this.servicioForm.estado().markAsTouched()
    this.servicioForm.modalidad().markAsTouched()
    this.servicioForm.profesional_id().markAsTouched()
    this.servicioForm.categoria_id().markAsTouched()
    this.servicioForm.especialidades_Ids().markAsTouched()
  }

  private formularioInvalido(): boolean {
    return (
      this.servicioForm.servicio().invalid() ||
      this.servicioForm.descripcion().invalid() ||
      this.servicioForm.precio().invalid() ||
      this.servicioForm.duracion_estimada().invalid() ||
      this.servicioForm.estado().invalid() ||
      this.servicioForm.modalidad().invalid() ||
      this.servicioForm.profesional_id().invalid() ||
      this.servicioForm.categoria_id().invalid() ||
      this.servicioForm.especialidades_Ids().invalid()
    )
  }

  private emitirGuardar() {
    const dto = this.buildDto()
    this.guardar.emit(dto)
  }

  private buildDto(): ServicioCreateDto | ServicioUpdateDto {
    const value = this.servicioModel()

    return {
      servicio: value.servicio.trim(),
      descripcion: value.descripcion.trim(),
      precio: Number(value.precio),
      duracion_estimada: Number(value.duracion_estimada),
      estado: value.estado,
      modalidad: value.modalidad as Modalidad,
      profesional_id: Number(value.profesional_id),
      categoria_id: Number(value.categoria_id),
      especialidades_Ids: value.especialidades_Ids,
    }
  }
}
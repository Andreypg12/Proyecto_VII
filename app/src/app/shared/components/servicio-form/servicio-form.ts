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

  servicio = input<Servicio | null>(null)
  categorias = input<CategoriaServicio[]>([])
  profesionales = input<Profesional[]>([])
  especialidades = input<Especialidad[]>([])
  modalidades = input<Modalidad[]>([])

  saving = input<boolean>(false)

  guardar = output<ServicioCreateDto | ServicioUpdateDto>()
  cancelar = output<void>()

  servicioModel = signal<ServicioFormModel>({
    servicio: '',
    descripcion: '',
    precio: 0,
    duracion_estimada: 0,
    estado: true,
    modalidad: 'VIRTUAL',
    id_categoria: 0,
    id_profesional: 0,
    especialidades_Ids: [],
  })

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
          message: 'El precio no puede superar ₡1 000 000'
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
      const duracion_estimada = Number(ctx.value())
      if (!Number.isInteger(duracion_estimada)) {
        return {
          kind: 'duracionEntero',
          message: 'La duración debe ser un número entero'
        }
      }
      return undefined
    })

    required(path.estado, {
      message: 'Se debe seleccionar un estado'
    })

    required(path.modalidad, {
      message: 'Se debe seleccionar una modalidad'
    })

    required(path.id_profesional, {
      message: 'Debe tener un profesional asociado'
    })

    required(path.id_categoria, {
      message: 'Seleccione una categoría'
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

  isEdit = computed(() => this.servicio() !== null)

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
        id_profesional: servicio.id_profesional ?? null,
        id_categoria: servicio.id_categoria ?? null,
        especialidades_Ids: servicio.especialidades?.map((item) => item.id) ?? [],
      })
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
      id_categoria: 0,
      id_profesional: 0,
      especialidades_Ids: [],
    })
  }

  toggleEspecialidad(id: number, checked: boolean) {
    this.servicioModel.update((value) => ({
      ...value,
      especialidades_Ids: checked
        ? Array.from(new Set([...value.especialidades_Ids, id]))
        : value.especialidades_Ids.filter((item) => item !== id),
    }))
  }

  isEspecialidadSelected(id: number): boolean {
    return this.servicioModel().especialidades_Ids.includes(id)
  }

  submit() {
    if (this.isSubmitting()) return
    this.marcarCamposComoTocados()
    if (this.formularioInvalido()) return

    this.emitirGuardar()
  }

  private marcarCamposComoTocados() {
    this.servicioForm.servicio().markAsTouched()
    this.servicioForm.descripcion().markAsTouched()
    this.servicioForm.precio().markAsTouched()
    this.servicioForm.duracion_estimada().markAsTouched()
    this.servicioForm.estado().markAsTouched()
    this.servicioForm.modalidad().markAsTouched()
    this.servicioForm.id_profesional().markAsTouched()
    this.servicioForm.id_categoria().markAsTouched()
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
      this.servicioForm.id_profesional().invalid() ||
      this.servicioForm.id_categoria().invalid() ||
      this.servicioForm.especialidades_Ids().invalid()
    )
  }

  private emitirGuardar() {
    const dto = this.buildDto()
    console.log('JSON enviado al API:', dto)
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
      modalidad: value.modalidad,
      id_profesional: Number(value.id_profesional),
      id_categoria: Number(value.id_categoria),
      especialidades_Ids: value.especialidades_Ids,
    }
  }
}
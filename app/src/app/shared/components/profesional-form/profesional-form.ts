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
  pattern,
  email
} from '@angular/forms/signals'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { UbicacionService } from '../../../core/services/ubicacion.service';

import {
  Profesional,
  ProfesionalCreateDto,
  ProfesionalFormModel,
  ProfesionalUpdateDto,
  Modalidad
} from '../../../core/models/profesional.model'

import { Especialidad } from '../../../core/models/especialidad.model'
import { ImageService } from '../../../core/services/image.service'

@Component({
  selector: 'app-profesional-form',
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
  templateUrl: './profesional-form.html',
  styleUrl: './profesional-form.css',
})
export class ProfesionalForm {
  private readonly imageService = inject(ImageService)
  private readonly ubicacionService = inject(UbicacionService)

  profesional = input<Profesional | null>(null)
  especialidades = input<Especialidad[]>([])
  saving = input<boolean>(false)

  guardar = output<ProfesionalCreateDto | ProfesionalUpdateDto>()
  cancelar = output<void>()

  uploadingImage = signal(false)
  imagePreview = signal<string | null>(null)
  selectedImageFile = signal<File | null>(null)

  // Datos de ubicación
  provincias = signal<any[]>([])
  cantones = signal<any[]>([])
  distritos = signal<any[]>([])
  cargandoUbicacion = signal(false)

  // Modelo del formulario adaptado al backend
  profesionalModel = signal<ProfesionalFormModel>({
    titulo: '',
    descripcion: '',
    tarifa_por_hora: 0,
    annos_experiencia: 0,
    imagen_profesional: '',
    disponibilidad: true,
    telefono: '',
    modalidad: 'VIRTUAL',
    // Datos de usuario
    email: '',
    nombre: '',
    apellidos: '',
    password: '',
    // Datos de ubicación
    ciudad: '',
    canton: '',
    distrito: '',
    id_distrito: 0,
    descripcionUbicacion: '',
    provinciaSeleccionada: null,
    cantonSeleccionado: null,
    distritoSeleccionado: null,
    // Especialidades
    especialidades_Ids: [],
  })

  profesionalForm = form(this.profesionalModel, (path) => {
    // ===== VALIDACIONES DEL PROFESIONAL =====
    required(path.titulo, {
      message: 'El título profesional es obligatorio'
    })
    minLength(path.titulo, 5, {
      message: 'Mínimo 5 caracteres'
    })
    maxLength(path.titulo, 100, {
      message: 'Máximo 100 caracteres'
    })
    pattern(path.titulo, /^[a-zA-ZÁÉÍÓÚáéíóúÑñ0-9\s:'\-&.]+$/, {
      message: 'El título solo puede contener letras, números, espacios y signos básicos'
    })
    validate(path.titulo, (ctx) => {
      const titulo = ctx.value().trim()
      if (titulo.length > 0 && titulo === titulo.toUpperCase()) {
        return {
          kind: 'tituloMayusculas',
          message: 'No escriba todo el título en mayúsculas'
        }
      }
      return undefined
    })

    required(path.descripcion, {
      message: 'La descripción es obligatoria'
    })
    minLength(path.descripcion, 30, {
      message: 'La descripción debe tener mínimo 30 caracteres'
    })
    maxLength(path.descripcion, 500, {
      message: 'Máximo 500 caracteres'
    })
    validate(path.descripcion, (ctx) => {
      const descripcion = ctx.value().trim()
      if (descripcion.length > 0 && descripcion.split(/\s+/).length < 8) {
        return {
          kind: 'descripcionCorta',
          message: 'La descripción debe contener al menos 8 palabras'
        }
      }
      return undefined
    })

    required(path.tarifa_por_hora, {
      message: 'La tarifa por hora es obligatoria'
    })
    min(path.tarifa_por_hora, 1, {
      message: 'La tarifa debe ser mayor a 0'
    })
    validate(path.tarifa_por_hora, (ctx) => {
      const tarifa = Number(ctx.value())
      if (tarifa > 1000000) {
        return {
          kind: 'tarifaExcesiva',
          message: 'La tarifa no puede superar $1,000,000'
        }
      }
      return undefined
    })

    required(path.annos_experiencia, {
      message: 'Los años de experiencia son obligatorios'
    })
    min(path.annos_experiencia, 0, {
      message: 'Los años de experiencia no pueden ser negativos'
    })
    validate(path.annos_experiencia, (ctx) => {
      const annos = Number(ctx.value())
      if (!Number.isInteger(annos)) {
        return {
          kind: 'experienciaEntero',
          message: 'Los años de experiencia deben ser un número entero'
        }
      }
      if (annos > 50) {
        return {
          kind: 'experienciaExcesiva',
          message: 'Los años de experiencia no pueden superar 50'
        }
      }
      return undefined
    })

    required(path.telefono, {
      message: 'El teléfono es obligatorio'
    })
    pattern(path.telefono, /^[0-9\s\-+()]+$/, {
      message: 'El teléfono solo puede contener números, espacios y signos + - ( )'
    })
    minLength(path.telefono, 8, {
      message: 'Mínimo 8 caracteres'
    })
    maxLength(path.telefono, 15, {
      message: 'Máximo 15 caracteres'
    })

    required(path.modalidad, {
      message: 'Seleccione una modalidad'
    })

    // ===== VALIDACIONES DEL USUARIO =====
    required(path.email, {
      message: 'El email es obligatorio'
    })
    email(path.email, {
      message: 'El email no es válido'
    })
    maxLength(path.email, 100, {
      message: 'Máximo 100 caracteres'
    })

    required(path.nombre, {
      message: 'El nombre es obligatorio'
    })
    minLength(path.nombre, 2, {
      message: 'Mínimo 2 caracteres'
    })
    maxLength(path.nombre, 50, {
      message: 'Máximo 50 caracteres'
    })
    pattern(path.nombre, /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: 'El nombre solo puede contener letras y espacios'
    })

    required(path.apellidos, {
      message: 'Los apellidos son obligatorios'
    })
    minLength(path.apellidos, 2, {
      message: 'Mínimo 2 caracteres'
    })
    maxLength(path.apellidos, 50, {
      message: 'Máximo 50 caracteres'
    })
    pattern(path.apellidos, /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, {
      message: 'Los apellidos solo pueden contener letras y espacios'
    })

    required(path.password, {
      message: 'La contraseña es obligatoria'
    })
    minLength(path.password, 6, {
      message: 'Mínimo 6 caracteres'
    })

    // ===== VALIDACIONES DE UBICACIÓN =====
    required(path.ciudad, {
      message: 'La ciudad es obligatoria'
    })
    minLength(path.ciudad, 2, {
      message: 'Mínimo 2 caracteres'
    })

    required(path.canton, {
      message: 'El cantón es obligatorio'
    })
    minLength(path.canton, 2, {
      message: 'Mínimo 2 caracteres'
    })

    required(path.distrito, {
      message: 'El distrito es obligatorio'
    })
    minLength(path.distrito, 2, {
      message: 'Mínimo 2 caracteres'
    })

    required(path.descripcionUbicacion, {
      message: 'La descripción de ubicación es obligatoria'
    })
    minLength(path.descripcionUbicacion, 5, {
      message: 'Mínimo 5 caracteres'
    })

    // ===== ESPECIALIDADES =====
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

  isEdit = computed(() => this.profesional() !== null)
  isSubmitting = computed(() => this.saving() || this.uploadingImage())

  constructor() {
    this.cargarProvincias()

    // Efecto para cargar datos de edición
    effect(() => {
      const prof = this.profesional()
      if (!prof) {
        this.resetForm()
        return
      }

      // Cargar datos para edición
      this.profesionalModel.set({
        titulo: prof.titulo ?? '',
        descripcion: prof.descripcion ?? '',
        tarifa_por_hora: Number(prof.tarifa_por_hora ?? 0),
        annos_experiencia: Number(prof.annos_experiencia ?? 0),
        imagen_profesional: prof.imagen_profesional ?? '',
        disponibilidad: prof.disponibilidad ?? true,
        telefono: prof.telefono ?? '',
        modalidad: prof.modalidad ?? 'VIRTUAL',
        // Datos de usuario
        email: prof.usuario?.email ?? '',
        nombre: prof.usuario?.nombre ?? '',
        apellidos: prof.usuario?.apellidos ?? '',
        password: '',
        // Datos de ubicación
        ciudad: prof.ubicaciones?.[0]?.ciudad ?? '',
        canton: prof.ubicaciones?.[0]?.canton ?? '',
        distrito: prof.ubicaciones?.[0]?.distrito ?? '',
        id_distrito: prof.ubicaciones?.[0]?.id_distrito ?? 0,
        descripcionUbicacion: prof.ubicaciones?.[0]?.descripcion ?? '',
        provinciaSeleccionada: null,
        cantonSeleccionado: null,
        distritoSeleccionado: null,
        // Especialidades
        especialidades_Ids: prof.especialidades?.map((e) => e.id) ?? [],
      })

      this.selectedImageFile.set(null)
      this.imagePreview.set(
        prof.imagen_profesional ? this.imageService.getImageUrl(prof.imagen_profesional) : null
      )
    })
  }

  private resetForm() {
    this.profesionalModel.set({
      titulo: '',
      descripcion: '',
      tarifa_por_hora: 0,
      annos_experiencia: 0,
      imagen_profesional: '',
      disponibilidad: true,
      telefono: '',
      modalidad: 'VIRTUAL',
      email: '',
      nombre: '',
      apellidos: '',
      password: '',
      ciudad: '',
      canton: '',
      distrito: '',
      id_distrito: 0,
      descripcionUbicacion: '',
      provinciaSeleccionada: null,
      cantonSeleccionado: null,
      distritoSeleccionado: null,
      especialidades_Ids: [],
    })
    this.selectedImageFile.set(null)
    this.imagePreview.set(null)
  }

  cargarProvincias() {
    this.cargandoUbicacion.set(true);
    this.ubicacionService.obtenerProvincias().subscribe({
      next: (data) => {
        console.log('✅ Provincias cargadas:', data);
        this.provincias.set(data || []);
        this.cargandoUbicacion.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando provincias:', error);
        this.cargandoUbicacion.set(false);
        this.provincias.set([]);
      }
    });
  }

  onProvinciaChange(provinciaId: number) {
    // Limpiar selecciones anteriores
    this.cantones.set([]);
    this.distritos.set([]);

    if (!provinciaId) {
      this.profesionalModel.update(model => ({
        ...model,
        provinciaSeleccionada: null,
        cantonSeleccionado: null,
        distritoSeleccionado: null,
        ciudad: '',
        canton: '',
        distrito: ''
      }));
      return;
    }

    // Buscar el nombre de la provincia seleccionada
    const provincia = this.provincias().find(p => p.id === provinciaId);

    this.profesionalModel.update(model => ({
      ...model,
      provinciaSeleccionada: provinciaId,
      cantonSeleccionado: null,
      distritoSeleccionado: null,
      ciudad: provincia?.nombre || '',
      canton: '',
      distrito: ''
    }));

    // Cargar cantones
    this.cargandoUbicacion.set(true);
    this.ubicacionService.obtenerCantones(provinciaId).subscribe({
      next: (data) => {
        console.log('✅ Cantones cargados:', data);
        this.cantones.set(data || []);
        this.cargandoUbicacion.set(false);
      },
      error: () => {
        console.error('❌ Error cargando cantones');
        this.cantones.set([]);
        this.cargandoUbicacion.set(false);
      }
    });
  }

  onCantonChange(cantonId: number) {
    this.distritos.set([]);

    if (!cantonId) {
      this.profesionalModel.update(model => ({
        ...model,
        cantonSeleccionado: null,
        distritoSeleccionado: null,
        canton: '',
        distrito: ''
      }));
      return;
    }

    // Buscar el nombre del cantón seleccionado
    const canton = this.cantones().find(c => c.id === cantonId);

    this.profesionalModel.update(model => ({
      ...model,
      cantonSeleccionado: cantonId,
      distritoSeleccionado: null,
      canton: canton?.nombre || '',
      distrito: ''
    }));

    const provinciaId = this.profesionalModel().provinciaSeleccionada;
    if (provinciaId && cantonId) {
      this.cargandoUbicacion.set(true);
      this.ubicacionService.obtenerDistritos(provinciaId, cantonId).subscribe({
        next: (data) => {
          console.log('✅ Distritos cargados:', data);
          this.distritos.set(data || []);
          this.cargandoUbicacion.set(false);
        },
        error: () => {
          console.error('❌ Error cargando distritos');
          this.distritos.set([]);
          this.cargandoUbicacion.set(false);
        }
      });
    }
  }

  onDistritoChange(distritoId: number) {
    if (!distritoId) {
      this.profesionalModel.update(model => ({
        ...model,
        distritoSeleccionado: null,
        distrito: '',
        id_distrito: 0  // ← Resetear a 0
      }));
      return;
    }

    const distrito = this.distritos().find(d => d.id === distritoId);
    if (distrito) {
      const canton = this.cantones().find(c => c.id === this.profesionalModel().cantonSeleccionado);
      const provincia = this.provincias().find(p => p.id === this.profesionalModel().provinciaSeleccionada);

      this.profesionalModel.update(model => ({
        ...model,
        distritoSeleccionado: distritoId,
        distrito: distrito.nombre || '',
        canton: canton?.nombre || model.canton,
        ciudad: provincia?.nombre || model.ciudad,
        id_distrito: distritoId  // ← Guardar el ID real
      }));
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    this.selectedImageFile.set(file)
    this.imagePreview.set(URL.createObjectURL(file))
  }

  toggleEspecialidad(id: number, checked: boolean) {
    this.profesionalModel.update((value) => ({
      ...value,
      especialidades_Ids: checked
        ? [...value.especialidades_Ids, id]
        : value.especialidades_Ids.filter((item) => item !== id),
    }))
    this.profesionalForm.especialidades_Ids().markAsTouched()
  }

  isEspecialidadSelected(id: number): boolean {
    return this.profesionalModel().especialidades_Ids.includes(id)
  }

  submit() {
    if (this.isSubmitting()) return
    this.marcarCamposComoTocados()
    if (this.formularioInvalido()) return
    const file = this.selectedImageFile()
    if (file) {
      this.subirImagenYGuardar(file)
      return
    }
    this.emitirGuardar()
  }

  private marcarCamposComoTocados() {
    this.profesionalForm.titulo().markAsTouched()
    this.profesionalForm.descripcion().markAsTouched()
    this.profesionalForm.tarifa_por_hora().markAsTouched()
    this.profesionalForm.annos_experiencia().markAsTouched()
    this.profesionalForm.telefono().markAsTouched()
    this.profesionalForm.modalidad().markAsTouched()
    this.profesionalForm.email().markAsTouched()
    this.profesionalForm.nombre().markAsTouched()
    this.profesionalForm.apellidos().markAsTouched()
    this.profesionalForm.password().markAsTouched()
    this.profesionalForm.ciudad().markAsTouched()
    this.profesionalForm.canton().markAsTouched()
    this.profesionalForm.distrito().markAsTouched()
    this.profesionalForm.descripcionUbicacion().markAsTouched()
    this.profesionalForm.especialidades_Ids().markAsTouched()
  }

  private formularioInvalido(): boolean {
    return (
      this.profesionalForm.titulo().invalid() ||
      this.profesionalForm.descripcion().invalid() ||
      this.profesionalForm.tarifa_por_hora().invalid() ||
      this.profesionalForm.annos_experiencia().invalid() ||
      this.profesionalForm.telefono().invalid() ||
      this.profesionalForm.modalidad().invalid() ||
      this.profesionalForm.email().invalid() ||
      this.profesionalForm.nombre().invalid() ||
      this.profesionalForm.apellidos().invalid() ||
      this.profesionalForm.password().invalid() ||
      this.profesionalForm.ciudad().invalid() ||
      this.profesionalForm.canton().invalid() ||
      this.profesionalForm.distrito().invalid() ||
      this.profesionalForm.descripcionUbicacion().invalid() ||
      this.profesionalForm.especialidades_Ids().invalid()
    )
  }

  private subirImagenYGuardar(file: File) {
    this.uploadingImage.set(true)
    this.imageService.upload(file).subscribe({
      next: (response) => {
        this.profesionalModel.update((value) => ({
          ...value,
          imagen_profesional: response.fileName,
        }))
        this.selectedImageFile.set(null)
        this.emitirGuardar()
      },
      error: () => {
        alert('No se pudo subir la imagen')
        this.uploadingImage.set(false)
      },
      complete: () => {
        this.uploadingImage.set(false)
      },
    })
  }

  private emitirGuardar() {
    const dto = this.buildDto()
    console.log('JSON enviado al API:', JSON.stringify(dto, null, 2))
    this.guardar.emit(dto)
  }

  private buildDto(): ProfesionalCreateDto | ProfesionalUpdateDto {
    const value = this.profesionalModel()

    // Estructura para CREAR
    if (!this.isEdit()) {
      return {
        titulo: value.titulo.trim(),
        descripcion: value.descripcion.trim(),
        tarifa_por_hora: Number(value.tarifa_por_hora),
        annos_experiencia: Number(value.annos_experiencia),
        imagen_profesional: value.imagen_profesional,
        disponibilidad: value.disponibilidad,
        telefono: value.telefono.trim(),
        modalidad: value.modalidad,
        usuario: {
          email: value.email.trim(),
          nombre: value.nombre.trim(),
          apellidos: value.apellidos.trim(),
          password: value.password,
        },
        ubicacion: {
          descripcion: value.descripcionUbicacion.trim(),
          id_distrito: value.id_distrito,
          distrito: value.distrito.trim(),
          canton: value.canton.trim(),
          ciudad: value.ciudad.trim(),
        },
        especialidades_Ids: value.especialidades_Ids,
      } as ProfesionalCreateDto
    }

    // Estructura para ACTUALIZAR
    return {
      titulo: value.titulo.trim(),
      descripcion: value.descripcion.trim(),
      tarifa_por_hora: Number(value.tarifa_por_hora),
      annos_experiencia: Number(value.annos_experiencia),
      imagen_profesional: value.imagen_profesional,
      disponibilidad: value.disponibilidad,
      telefono: value.telefono.trim(),
      modalidad: value.modalidad,
      usuario: {
        email: value.email.trim(),
        nombre: value.nombre.trim(),
        apellidos: value.apellidos.trim(),
        password: value.password || undefined,
      },
      ubicacion: {
        descripcion: value.descripcionUbicacion.trim(),
        id_distrito: value.id_distrito,
        distrito: value.distrito.trim(),
        canton: value.canton.trim(),
        ciudad: value.ciudad.trim(),
      },
      especialidades_Ids: value.especialidades_Ids,
    } as ProfesionalUpdateDto
  }
}
import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';

import Swal from 'sweetalert2';

//Rutas
import { Router } from '@angular/router';

//FullCalendar
import {
  CalendarOptions,
  EventClickInfo,
  EventInput,
  FullCalendarModule
} from '@fullcalendar/angular';

//Para backend de citas
import { CitaService } from '../../../core/services/cita.service';
import {
  Cita,
  ConfiguracionCita,
  CreateCitaDto,
  EstadoCita,
  FiltrosCita
} from '../../../core/models/cita.model';


//Plugins
import themePlugin from '@fullcalendar/angular/themes/monarch';
import dayGridPlugin from '@fullcalendar/angular/daygrid';
import timeGridPlugin from '@fullcalendar/angular/timegrid';
import interactionPlugin from '@fullcalendar/angular/interaction';

@Component({
  selector: 'app-citas-agenda',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule
  ],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css'
})
export class CitasAgenda implements OnInit {

  private readonly citaService = inject(CitaService);
  private readonly router = inject(Router);

  loading = signal(false);
  error = signal<string | null>(null);

  calendarOptions: CalendarOptions = {
    plugins: [
      themePlugin,
      dayGridPlugin,
      timeGridPlugin,
      interactionPlugin
    ],

    initialView: 'dayGridMonth',

    headerToolbar: {
      start: 'prev,next today',
      center: 'title',
      end: 'dayGridMonth,timeGridWeek'
    },

    buttons: {
      today: {
        text: 'Hoy',
        display: 'text'
      },
      dayGridMonth: {
        text: 'Mes',
        display: 'text'
      },
      timeGridWeek: {
        text: 'Semana',
        display: 'text'
      }
    },

    // Hace que los eventos mensuales sean rectángulos
    eventDisplay: 'block',

    // Muestra también la hora final
    displayEventEnd: true,

    // Evita que demasiadas citas deformen una celda
    dayMaxEventRows: 3,
    moreLinkClick: 'popover',

    // Horario útil de la agenda semanal
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',

    // Oculta la fila "todo el día"
    allDaySlot: false,

    nowIndicator: true,
    height: 'auto',

    events: [],

    dateClick: (info) => {
      this.seleccionarFecha(
        info.date,
        info.allDay
      );
    },

    eventClick: (info) => {
      this.abrirDetalleCita(info);
    }
  };

  //Backend

  //Cargar las citas del backend
  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.listar().subscribe({
      next: (response) => {
        const citas = response.data ?? [];

        console.table(
          citas.map((cita: Cita) => ({
            id: cita.id,
            estadoOriginal: cita.estado,
            estadoNormalizado: String(cita.estado ?? '')
              .trim()
              .toUpperCase()
          }))
        );

        const eventos: EventInput[] = citas.map(
          (cita: Cita) => this.convertirCitaAEvento(cita)
        );

        //Nuevo objeto para que Angular y FullCalendar detecten correctamente el cambio.
        this.calendarOptions = {
          ...this.calendarOptions,
          events: eventos
        };

        console.log('Citas recibidas:', citas);
        console.log('Eventos del calendario:', eventos);

        this.loading.set(false);
      },

      error: (error) => {
        console.error('Error al cargar las citas:', error);

        this.error.set(
          'No fue posible cargar las citas desde el servidor.'
        );

        this.loading.set(false);
      }
    });
  }

  //Convertir una cita en un evento de FullCalendar

  private convertirCitaAEvento(cita: Cita): EventInput {

    //Se normaliza el estado recibido
    const estadoNormalizado = String(cita.estado ?? '')
      .trim()
      .toUpperCase();

    const color = this.obtenerColorEstado(estadoNormalizado);

    return {
      id: String(cita.id),

      title: this.obtenerTituloCita(cita),

      start: cita.fecha_hora_inicio,
      end: cita.fecha_hora_finalizacion_esperada,

      allDay: false,

      // Forma rectangular también en vista mensual
      display: 'block',

      // Propiedades de color de FullCalendar 7
      color,
      contrastColor: '#ffffff',

      extendedProps: {
        estado: estadoNormalizado,
        modalidad: cita.modalidad,
        comentario: cita.comentario_cliente,
        montoEstimado: cita.monto_estimado,
        cita
      }
    };
  }

  private obtenerTituloCita(cita: Cita): string {
    const servicio =
      cita.servicio?.servicio ??
      'Servicio';

    const nombreCliente =
      cita.cliente
        ? `${cita.cliente.nombre} ${cita.cliente.apellidos}`
        : 'Cliente';

    return `${servicio} - ${nombreCliente}`;
  }

  // Asignar colores por estado
  private obtenerColorEstado(
  estado: string
): string {

  const colores: Record<string, string> = {
      PENDIENTE: '#d97706',

      ACEPTADA: '#16a34a',
      CONFIRMADA: '#16a34a',

      COMPLETADA: '#2563eb',
      FINALIZADA: '#2563eb',

      RECHAZADA: '#dc2626',

      CANCELADA: '#64748b',

      'EN PROCESO': '#7c3aed',
      EN_PROCESO: '#7c3aed'
    };

    return colores[estado] ?? '#64748b';
  }

  //Abrir detalle al seleccionar una cita
  abrirDetalleCita(info: EventClickInfo): void {
    const idCita = Number(info.event.id);

    this.router.navigate([
      '/citas',
      idCita
    ]);
  }

  async seleccionarFecha(fechaSeleccionada: Date,esDiaCompleto: boolean): Promise<void> {

    const ahora = new Date();

    const inicioHoy = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate()
    );

    const inicioFechaSeleccionada = new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      fechaSeleccionada.getDate()
    );

    // No hacer nada si se selecciona un día anterior.
    if (
      inicioFechaSeleccionada.getTime() <
      inicioHoy.getTime()
    ) {
      return;
    }

    const esHoy =
      inicioFechaSeleccionada.getTime() ===
      inicioHoy.getTime();

    if (esHoy) {

      if (esDiaCompleto) {

        // En la vista mensual no existe una hora seleccionada.
        // Se permite abrir el formulario mientras todavía
        // haya horario disponible durante el día.
        const horaLimite = new Date(
          ahora.getFullYear(),
          ahora.getMonth(),
          ahora.getDate(),
          20,
          0,
          0
        );

        if (ahora >= horaLimite) {
          return;
        }

      } else {

        // En la vista semanal sí se selecciona una hora.
        if (fechaSeleccionada <= ahora) {
          return;
        }
      }
    }

    const fechaFormulario =
      this.formatearFechaParametro(
        fechaSeleccionada
      );

    const fechaVisible =
      new Intl.DateTimeFormat(
        'es-CR',
        {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }
      ).format(fechaSeleccionada);

    const resultado =
      await Swal.fire({
        title: 'Crear una cita',

        html:
          `Seleccionó el día ` +
          `<strong>${fechaVisible}</strong>.<br><br>` +
          `¿Desea crear una cita para esta fecha?`,

        icon: 'question',

        showCancelButton: true,

        confirmButtonText: 'Sí, crear cita',
        cancelButtonText: 'Cancelar',

        confirmButtonColor: '#15803d',
        cancelButtonColor: '#475569',

        reverseButtons: true,

        background: '#0f172a',
        color: '#f8fafc'
      });

    if (!resultado.isConfirmed) {
      return;
    }

    await this.router.navigate(
      ['/citas/nueva'],
      {
        queryParams: {
          fecha: fechaFormulario,

          hora: esDiaCompleto
            ? null
            : this.formatearHoraParametro(
              fechaSeleccionada
            )
        }
      }
    );
  }

  private formatearFechaParametro(
    fecha: Date
  ): string {

    const anio =
      fecha.getFullYear();

    const mes =
      String(fecha.getMonth() + 1)
        .padStart(2, '0');

    const dia =
      String(fecha.getDate())
        .padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }


  private formatearHoraParametro(
    fecha: Date
  ): string {

    const horas =
      String(fecha.getHours())
        .padStart(2, '0');

    const minutos =
      String(fecha.getMinutes())
        .padStart(2, '0');

    return `${horas}:${minutos}`;
  }

  seleccionarCita(id: string, titulo: string): void {
    alert(`Cita seleccionada: ${titulo}\nIdentificador: ${id}`);
  }
}
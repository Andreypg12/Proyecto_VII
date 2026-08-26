import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-valoracion-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule],
    templateUrl: './valoracion-modal.html',
    styleUrl: './valoracion-modal.css',
})
export class ValoracionModal {

    @Input() visible = false;
    @Input() idCita = 0;
    @Input() idProfesional = 0;
    @Input() idCliente = 0;
    @Input() nombreServicio = '';
    @Input() nombreProfesional = '';

    @Output() cerrar = new EventEmitter<void>();
    @Output() guardado = new EventEmitter<{ puntuacion: number; comentario: string }>();

    puntuacion = signal(0);
    puntuacionHover = signal(0);
    comentario = signal('');
    enviando = signal(false);
    error = signal('');

    get estrellas(): number[] {
        return [1, 2, 3, 4, 5];
    }

    get puntuacionMostrar(): number {
        return this.puntuacionHover() || this.puntuacion();
    }

    seleccionarEstrella(valor: number): void {
        this.puntuacion.set(valor);
    }

    hoverEstrella(valor: number): void {
        this.puntuacionHover.set(valor);
    }

    leaveEstrellas(): void {
        this.puntuacionHover.set(0);
    }

    actualizarComentario(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.comentario.set(textarea.value);
    }

    onOverlayClick(event: Event): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.cerrar.emit();
        }
    }

    onCerrar(): void {
        this.cerrar.emit();
    }

    onEnviar(): void {
        if (this.puntuacion() === 0) {
            this.error.set('Debe seleccionar una puntuación.');
            return;
        }

        if (!this.comentario().trim()) {
            this.error.set('Debe escribir un comentario.');
            return;
        }

        this.error.set('');
        this.enviando.set(true);

        this.guardado.emit({
            puntuacion: this.puntuacion(),
            comentario: this.comentario().trim(),
        });
    }

    terminarEnvio(): void {
        this.enviando.set(false);
    }

    textoPuntuacion(): string {
        const val = this.puntuacionMostrar;
        if (val === 0) return '';
        if (val === 1) return 'Muy mala';
        if (val === 2) return 'Mala';
        if (val === 3) return 'Regular';
        if (val === 4) return 'Buena';
        return 'Excelente';
    }
}

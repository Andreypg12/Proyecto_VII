import {
    Component,
    effect,
    inject,
    signal
} from '@angular/core';

import {
    email,
    form,
    FormField,
    maxLength,
    minLength,
    required
} from '@angular/forms/signals';

import { HttpErrorResponse } from '@angular/common/http';

import { finalize } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

import {
    UpdatePerfilUsuarioDto
} from '../../../core/models/usuario.model';


interface PerfilFormModel {
    email: string;
    nombre: string;
    apellidos: string;
    telefono: string;
    password: string;
}


@Component({
    selector: 'app-perfil',

    standalone: true,

    imports: [
        FormField,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],

    templateUrl: './perfil.html',
    styleUrl: './perfil.css',
})
export class Perfil {

    private readonly authService = inject(AuthService);

    // Usuario global autenticado
    readonly usuario = this.authService.usuario;

    readonly guardando = signal(false);
    readonly mensajeError = signal('');
    readonly mensajeExito = signal('');
    readonly ocultarPassword = signal(true);
    readonly model =
        signal<PerfilFormModel>({

            email: '',
            nombre: '',
            apellidos: '',
            telefono: '',
            password: '',

        });

    readonly perfilForm =
        form(
            this.model,
            (path) => {
                        required(path.email, { message: 'El correo es obligatorio' });
                        email(path.email, { message: 'Debe ingresar un correo válido' });
                        maxLength(path.email, 150, { message: 'El correo no puede superar los 150 caracteres' });

                        required(path.nombre, { message: 'El nombre es obligatorio' });
                        minLength(path.nombre, 3, { message: 'El nombre debe tener al menos 3 caracteres' });

                        required(path.apellidos, { message: 'Los apellidos son obligatorios' });
                        minLength(path.apellidos, 3, { message: 'Los apellidos deben tener al menos 3 caracteres' });

                        maxLength(path.telefono, 20, { message: 'El teléfono no puede superar los 20 caracteres' });

                        minLength(path.password, 6, { message: 'La contraseña debe tener al menos 6 caracteres' });
                      }
        );


    constructor() {

        
          // Cuando AuthService tenga el usuario,
          // se llena el formulario con sus datos.
          
        effect(() => {

            const usuarioActual = this.usuario();
            if (!usuarioActual) { return;}

            this.model.set({
                email: usuarioActual.email,
                nombre: usuarioActual.nombre,
                apellidos: usuarioActual.apellidos,
                telefono: usuarioActual.telefono ?? '',
                // Nunca cargamos la contraseña actual.
                password: '',
            });
        });
    }

    cambiarVisibilidadPassword(): void {
        this.ocultarPassword.update( valor => !valor );
    }

    submit(): void {

        if ( this.guardando() || this.perfilForm().invalid()) {
            return;
        }

        this.mensajeError.set('');
        this.mensajeExito.set('');

        const valores = this.model();

        const data:
            UpdatePerfilUsuarioDto = {
            email: valores.email.trim(),
            nombre: valores.nombre.trim(),
            apellidos: valores.apellidos.trim(),
            telefono: valores.telefono.trim(),
        };

          // La contraseña solamente se envía
          // si el usuario escribió una nueva.
      
        if (valores.password.trim()) {
            data.password = valores.password;
        }

        this.guardando.set(true);

        this.authService
            .actualizarPerfil(data)
            .pipe(
                finalize(() =>
                    this.guardando.set(false)
                )
            )
            .subscribe({

                next: () => {
                    this.mensajeExito.set(
                        'Perfil actualizado correctamente.'
                    );

                    
                    // Se limpia únicamente contraseña.
                    // El resto queda con los datos actuales.
                    
                    this.model.update(
                        actual => ({
                            ...actual,
                            password: ''
                        })
                    );
                },
                error: ( error: HttpErrorResponse) => {
                    this.mensajeError.set(
                        error.error?.message ?? 'No fue posible actualizar el perfil.'
                    );
                }
            });
    }
}
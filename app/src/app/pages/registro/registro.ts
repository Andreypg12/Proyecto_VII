import {
    Component,
    computed,
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
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/usuario.model';


interface RegistroFormModel {
    nombre: string;
    apellidos: string;
    email: string;
    telefono: string;
    password: string;
    confirmarPassword: string;
}


@Component({
    selector: 'app-registro',

    standalone: true,

    imports: [
        RouterLink,
        FormField,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],

    templateUrl: './registro.html',
    styleUrl: './registro.css',
})
export class Registro {

    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    readonly registrando = signal(false);
    readonly mensajeError = signal('');
    readonly mensajeExito = signal('');
    readonly ocultarPassword = signal(true);
    readonly ocultarConfirmacion = signal(true);

    readonly model =
        signal<RegistroFormModel>({

            nombre: '',
            apellidos: '',
            email: '',
            telefono: '',
            password: '',
            confirmarPassword: '',

        });


    readonly registroForm =
        form(
            this.model,
            (path) => {

                required( path.nombre, { message:'El nombre es obligatorio' });
                
                minLength( path.nombre, 3, { message: 'El nombre debe tener al menos 3 caracteres' });
                
                maxLength(path.nombre, 100, { message: 'El nombre no puede superar los 100 caracteres'});
                
                required( path.apellidos, { message: 'Los apellidos son obligatorios'});
                
                minLength(path.apellidos,3,{message:'Los apellidos deben tener al menos 3 caracteres'});

                maxLength(path.apellidos,120,{message:'Los apellidos no pueden superar los 120 caracteres'});
                
                required(path.email,{message:'El correo es obligatorio'});

                email(path.email,{message:'Debe ingresar un correo válido'});

                maxLength(path.email,150,{message:'El correo no puede superar los 150 caracteres'});

                required( path.telefono, { message: 'El teléfono es obligatorio' });

                minLength( path.telefono, 8, { message: 'El teléfono debe tener al menos 8 caracteres' });

                maxLength( path.telefono, 20,{message:'El teléfono no puede superar los 20 caracteres'});

                required( path.password, { message: 'La contraseña es obligatoria'});

                minLength( path.password, 6,{ message: 'La contraseña debe tener al menos 6 caracteres'});

                maxLength(path.password,255,{message:'La contraseña no puede superar los 255 caracteres'});

                required( path.confirmarPassword,{message:'Debe confirmar la contraseña'});
            }
        );


    readonly passwordsNoCoinciden =
        computed(() => {
            const valores = this.model();
            if ( !valores.password || !valores.confirmarPassword) {
                return false;
            }
            return (
                valores.password !==
                valores.confirmarPassword
            );

        });


    cambiarVisibilidadPassword(): void {
        this.ocultarPassword.update( valor => !valor );
    }


    cambiarVisibilidadConfirmacion(): void {
        this.ocultarConfirmacion.update(
            valor => !valor
        );
    }


    registrar(): void {

        // Evitar doble envío mientras ya se está registrando
        if (this.registrando()) {
            return;
        }

        // Limpiar mensajes anteriores
        this.mensajeError.set('');
        this.mensajeExito.set('');

        // Marca el formulario y sus campos como tocados.
        // Esto permite mostrar los mensajes de validación.
        this.registroForm().markAsTouched();

        // Si el formulario tiene errores,
        // no se envía la petición al API.
        if ( this.registroForm().invalid() || this.passwordsNoCoinciden() ) {
            this.mensajeError.set( 'Complete correctamente los campos obligatorios.' );
            return;
        }


        const valores = this.model();


        const data: RegisterRequest = {
            nombre: valores.nombre.trim(),
            apellidos: valores.apellidos.trim(),
            email: valores.email.trim(),
            telefono: valores.telefono.trim(),
            password:valores.password,
        };

        this.registrando.set(true);

        this.authService
            .registrar(data)
            .pipe(

                finalize(() =>
                    this.registrando.set(false)
                )

            )
            .subscribe({

                next: () => {

                    this.mensajeExito.set(
                        'Cuenta creada correctamente.'
                    );


                    setTimeout(() => {

                        void this.router.navigate(
                            ['/login']
                        );

                    }, 1200);

                },


                error: (
                    error: HttpErrorResponse
                ) => {

                    this.mensajeError.set(
                        error.error?.message
                        ??
                        'No fue posible crear la cuenta.'
                    );

                }

            });

    }

}
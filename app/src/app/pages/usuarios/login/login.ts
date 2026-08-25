import {
    Component,
    inject,
    signal
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
    RouterLink
} from '@angular/router';

import {
    email,
    form,
    FormField,
    minLength,
    required
} from '@angular/forms/signals';

import { finalize } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/usuario.model';


@Component({
    selector: 'app-login',

    standalone: true,

    imports: [
        RouterLink,
        FormField,
        MatIconModule,
        MatProgressSpinnerModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],

    templateUrl: './login.html',

    styleUrl: './login.css',
})
export class Login {

    private readonly authService =
        inject(AuthService);

    private readonly router =
        inject(Router);

    private readonly route =
        inject(ActivatedRoute);


    readonly ocultarPassword =
        signal(true);

    readonly enviando =
        signal(false);

    readonly errorServidor =
        signal<string | null>(null);


    readonly model =
        signal<LoginRequest>({
            email: '',
            password: ''
        });


    readonly loginForm =
        form(this.model, (path) => {

            required(
                path.email,
                {
                    message:
                        'El correo es obligatorio.'
                }
            );

            email(
                path.email,
                {
                    message:
                        'Ingrese un correo válido.'
                }
            );

            required(
                path.password,
                {
                    message:
                        'La contraseña es obligatoria.'
                }
            );

            minLength(
                path.password,
                6,
                {
                    message:
                        'La contraseña debe tener al menos 6 caracteres.'
                }
            );
        });


    submit(): void {

        if (this.loginForm().invalid()) {
            return;
        }


        this.enviando.set(true);

        this.errorServidor.set(null);


        this.authService
            .login(this.model())
            .pipe(
                finalize(() =>
                    this.enviando.set(false)
                )
            )
            .subscribe({

                next: () => {
                    console.log(
                        this.authService.usuario()
                    );

                    const returnUrl =
                        this.route
                            .snapshot
                            .queryParamMap
                            .get('returnUrl')
                        ?? '/';


                    void this.router
                        .navigateByUrl(returnUrl);
                },


                error: (error) => {

                    this.errorServidor.set(
                        error.error?.message
                        ??
                        'No fue posible iniciar sesión.'
                    );
                }

            });
    }
}

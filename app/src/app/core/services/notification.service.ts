import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

export enum ToastType {
    Success = 'success',
    Info = 'info',
    Warning = 'warning',
    Error = 'error',
}

export interface ToastOptions {
    title?: string | null;
    message: string;
    type?: ToastType;
    duration?: number;
    redirectTo?: string;
}

@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    private readonly router = inject(Router);

    show({
        title = null,
        message,
        type = ToastType.Info,
        duration = 3000,
        redirectTo,
    }: ToastOptions): void {
        const text = title ? `${title}: ${message}` : message;

        switch (type) {
            case ToastType.Success:
                toast.success(text, { duration });
                break;

            case ToastType.Warning:
                toast.warning(text, { duration });
                break;

            case ToastType.Error:
                toast.error(text, { duration });
                break;

            default:
                toast.info(text, { duration });
                break;
        }

        if (redirectTo) {
            setTimeout(() => {
                this.router.navigateByUrl(redirectTo);
            }, duration);
        }
    }

    success(message: string, title?: string | null, duration = 3000, redirectTo?: string): void {
        this.show({ title, message, type: ToastType.Success, duration, redirectTo });
    }

    info(message: string, title?: string | null, duration = 3000, redirectTo?: string): void {
        this.show({ title, message, type: ToastType.Info, duration, redirectTo });
    }

    warning(message: string, title?: string | null, duration = 3000, redirectTo?: string): void {
        this.show({ title, message, type: ToastType.Warning, duration, redirectTo });
    }

    error(message: string, title?: string | null, duration = 5000, redirectTo?: string): void {
        this.show({ title, message, type: ToastType.Error, duration, redirectTo });
    }
}